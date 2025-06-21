import 'package:flutter/material.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:image_picker/image_picker.dart';
import 'package:camera/camera.dart';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'dart:ui' as ui;
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:tflite_flutter_helper/tflite_flutter_helper.dart';
import 'package:image/image.dart' as img;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ML Kit Face Detection',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ML Kit Face Detection')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const FaceDetectionPage()),
              ),
              child: const Text('Detect Faces from Gallery'),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const LiveCameraFaceDetection(),
                ),
              ),
              child: const Text('Live Camera Face Detection'),
            ),
          ],
        ),
      ),
    );
  }
}

class FaceDetectionPage extends StatefulWidget {
  const FaceDetectionPage({Key? key}) : super(key: key);

  @override
  State<FaceDetectionPage> createState() => _FaceDetectionPageState();
}

class _FaceDetectionPageState extends State<FaceDetectionPage> {
  File? _image;
  int? _faceCount;
  bool _isLoading = false;

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _image = File(pickedFile.path);
        _faceCount = null;
      });
      await _detectFaces(pickedFile.path);
    }
  }

  Future<void> _detectFaces(String imagePath) async {
    setState(() {
      _isLoading = true;
    });
    final inputImage = InputImage.fromFilePath(imagePath);
    final options = FaceDetectorOptions();
    final faceDetector = FaceDetector(options: options);
    try {
      final faces = await faceDetector.processImage(inputImage);
      setState(() {
        _faceCount = faces.length;
      });
    } catch (e) {
      setState(() {
        _faceCount = null;
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error detecting faces: \$e')));
    } finally {
      faceDetector.close();
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gallery Face Detection')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_image != null) Image.file(_image!, height: 250),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _pickImage,
                child: const Text('Pick Image'),
              ),
              const SizedBox(height: 24),
              if (_isLoading) const CircularProgressIndicator(),
              if (_faceCount != null && !_isLoading)
                Text('Faces detected: \$_faceCount'),
            ],
          ),
        ),
      ),
    );
  }
}

class FaceEmbedder {
  Interpreter? _interpreter;
  final int inputSize = 160; // FaceNet expects 160x160

  FaceEmbedder();

  Future<void> loadModel() async {
    _interpreter ??= await Interpreter.fromAsset('../assets/facenet.tflite');
  }

  // Preprocess: crop, resize, normalize
  TensorImage preprocessFace({
    required CameraImage image,
    required Rect boundingBox,
  }) {
    // Convert YUV420 to RGB
    final imgImage = _convertCameraImageToImage(image);
    final faceRect = boundingBox;
    final faceCrop = img.copyCrop(
      imgImage,
      faceRect.left.toInt(),
      faceRect.top.toInt(),
      faceRect.width.toInt(),
      faceRect.height.toInt(),
    );
    TensorImage tensorImage = TensorImage.fromImage(faceCrop);
    tensorImage = ImageProcessorBuilder()
        .add(ResizeOp(inputSize, inputSize, ResizeMethod.BILINEAR))
        .add(NormalizeOp(128, 128))
        .build()
        .process(tensorImage);
    return tensorImage;
  }

  // Run inference and get embedding
  List<double> getEmbedding(TensorImage input) {
    final output = List.filled(128, 0.0).reshape([1, 128]);
    _interpreter!.run(input.buffer, output);
    return List<double>.from(output[0]);
  }

  // Helper: Convert CameraImage (YUV420) to Image (from image package)
  // This is a simplified version; for production, use a robust converter
  static img.Image _convertCameraImageToImage(CameraImage image) {
    // Only works for Android YUV420 for now
    final int width = image.width;
    final int height = image.height;
    final img.Image imgImage = img.Image(width, height);
    final Plane plane = image.planes[0];
    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        final int pixel = plane.bytes[y * width + x];
        imgImage.setPixelRgba(x, y, pixel, pixel, pixel);
      }
    }
    return imgImage;
  }
}

class LiveCameraFaceDetection extends StatefulWidget {
  const LiveCameraFaceDetection({Key? key}) : super(key: key);

  @override
  State<LiveCameraFaceDetection> createState() =>
      _LiveCameraFaceDetectionState();
}

class _LiveCameraFaceDetectionState extends State<LiveCameraFaceDetection> {
  CameraController? _cameraController;
  late FaceDetector _faceDetector;
  bool _isDetecting = false;
  List<Face> _faces = [];
  bool _isCameraInitialized = false;
  FaceEmbedder? _faceEmbedder;
  List<double>? _embedding;
  CameraImage? _lastCameraImage;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
    _faceDetector = FaceDetector(
      options: FaceDetectorOptions(enableContours: true, enableLandmarks: true),
    );
    _faceEmbedder = FaceEmbedder();
    _faceEmbedder!.loadModel();
  }

  Future<void> _initializeCamera() async {
    final cameras = await availableCameras();
    final frontCamera = cameras.firstWhere(
      (camera) => camera.lensDirection == CameraLensDirection.front,
      orElse: () => cameras.first,
    );
    _cameraController = CameraController(
      frontCamera,
      ResolutionPreset.medium,
      enableAudio: false,
    );
    await _cameraController!.initialize();
    _cameraController!.startImageStream(_processCameraImage);
    setState(() {
      _isCameraInitialized = true;
    });
  }

  Future<void> _processCameraImage(CameraImage image) async {
    if (_isDetecting) return;
    _isDetecting = true;
    _lastCameraImage = image;
    try {
      final WriteBuffer allBytes = WriteBuffer();
      for (final Plane plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      final bytes = allBytes.done().buffer.asUint8List();
      final Size imageSize = Size(
        image.width.toDouble(),
        image.height.toDouble(),
      );
      final camera = _cameraController!.description;
      final imageRotation =
          InputImageRotationValue.fromRawValue(camera.sensorOrientation) ??
          InputImageRotation.rotation0deg;
      final inputImageFormat =
          InputImageFormatValue.fromRawValue(image.format.raw) ??
          InputImageFormat.nv21;
      final inputImage = InputImage.fromBytes(
        bytes: bytes,
        metadata: InputImageMetadata(
          size: imageSize,
          rotation: imageRotation,
          format: inputImageFormat,
          bytesPerRow: image.planes[0].bytesPerRow,
        ),
      );
      final faces = await _faceDetector.processImage(inputImage);
      List<double>? embedding;
      if (faces.isNotEmpty && _faceEmbedder != null) {
        // For demo: use the first detected face
        final face = faces.first;
        final tensorImage = _faceEmbedder!.preprocessFace(
          image: image,
          boundingBox: face.boundingBox,
        );
        embedding = _faceEmbedder!.getEmbedding(tensorImage);
      }
      setState(() {
        _faces = faces;
        _embedding = embedding;
      });
    } catch (e) {
      // Optionally handle errors
    } finally {
      _isDetecting = false;
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _faceDetector.close();
    super.dispose();
  }

  // Calculate the face rect in widget coordinates, accounting for aspect ratio and letterboxing
  Rect _calculateFaceRect({
    required Rect boundingBox,
    required Size imageSize,
    required Size widgetSize,
  }) {
    final double imageAspectRatio = imageSize.width / imageSize.height;
    final double widgetAspectRatio = widgetSize.width / widgetSize.height;

    double scale, offsetX = 0, offsetY = 0;

    if (widgetAspectRatio > imageAspectRatio) {
      // Widget is wider than the camera preview
      scale = widgetSize.height / imageSize.height;
      final fittedWidth = imageSize.width * scale;
      offsetX = (widgetSize.width - fittedWidth) / 2;
    } else {
      // Widget is taller than the camera preview
      scale = widgetSize.width / imageSize.width;
      final fittedHeight = imageSize.height * scale;
      offsetY = (widgetSize.height - fittedHeight) / 2;
    }

    return Rect.fromLTRB(
      boundingBox.left * scale + offsetX,
      boundingBox.top * scale + offsetY,
      boundingBox.right * scale + offsetX,
      boundingBox.bottom * scale + offsetY,
    );
  }

  String _faceInfoString() {
    if (_faces.isEmpty) return 'No faces detected.';
    return _faces
        .asMap()
        .entries
        .map((entry) {
          final i = entry.key;
          final face = entry.value;
          return 'Face #${i + 1}:\n'
              '  BoundingBox: ${face.boundingBox}\n'
              '  rotX: ${face.headEulerAngleX?.toStringAsFixed(2)}\n'
              '  rotY: ${face.headEulerAngleY?.toStringAsFixed(2)}\n'
              '  rotZ: ${face.headEulerAngleZ?.toStringAsFixed(2)}\n'
              '  SmilingProb: ${face.smilingProbability?.toStringAsFixed(2)}\n'
              '  TrackingId: ${face.trackingId ?? "-"}';
        })
        .join('\n\n');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Live Camera Face Detection')),
      body: _isCameraInitialized && _cameraController != null
          ? LayoutBuilder(
              builder: (context, constraints) {
                final previewSize = _cameraController!.value.previewSize!;
                final widgetSize = Size(
                  constraints.maxWidth,
                  constraints.maxHeight,
                );

                return Stack(
                  children: [
                    CameraPreview(_cameraController!),
                    ..._faces.map((face) {
                      final rect = _calculateFaceRect(
                        boundingBox: face.boundingBox,
                        imageSize: previewSize,
                        widgetSize: widgetSize,
                      );
                      return Positioned(
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height,
                        child: ClipRect(
                          child: BackdropFilter(
                            filter: ui.ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                            child: Container(
                              color: Colors.black.withOpacity(0.2),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                    Positioned(
                      bottom: 80,
                      left: 20,
                      right: 20,
                      child: Container(
                        color: Colors.black87,
                        padding: const EdgeInsets.all(8),
                        child: SingleChildScrollView(
                          child: Text(
                            _faceInfoString(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 20,
                      left: 20,
                      child: Container(
                        color: Colors.black54,
                        padding: const EdgeInsets.all(8),
                        child: Text(
                          'Faces detected: \\${_faces.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                          ),
                        ),
                      ),
                    ),
                    if (_embedding != null)
                      Positioned(
                        bottom: 160,
                        left: 20,
                        right: 20,
                        child: Container(
                          color: Colors.deepPurple.withOpacity(0.8),
                          padding: const EdgeInsets.all(8),
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Text(
                              'Embedding: ' +
                                  _embedding!
                                      .map((e) => e.toStringAsFixed(3))
                                      .join(', '),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                );
              },
            )
          : const Center(child: CircularProgressIndicator()),
    );
  }
}
