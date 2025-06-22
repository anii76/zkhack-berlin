import express, { Request, Response } from 'express';
import path from 'path';
import { get } from 'request';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const viewsDir = path.join(__dirname, 'views');
app.use(express.static(viewsDir));
app.use(express.static(path.join(__dirname, './public')));

app.get('/', (req: Request, res: Response) => res.sendFile(path.join(viewsDir, 'index.html')));
app.get('/scan', (req: Request, res: Response) => res.sendFile(path.join(viewsDir, 'scan.html')));
app.get('/generating', (req: Request, res: Response) => res.sendFile(path.join(viewsDir, 'generating.html')));
app.get('/receive', (req: Request, res: Response) => res.sendFile(path.join(viewsDir, 'receive.html')));
app.get('/face-scan', (req: Request, res: Response) => res.sendFile(path.join(viewsDir, 'face-scan.html')));
app.get('/success', (req: Request, res: Response) => res.sendFile(path.join(viewsDir, 'success.html')));


const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));

function request(url: string, returnBuffer = true, timeout = 10000): Promise<any> {
  return new Promise(function(resolve, reject) {
    const options = Object.assign(
      {},
      {
        url,
        isBuffer: true,
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
      },
      returnBuffer ? { encoding: null } : {}
    );

    get(options, function(err: any, res: any) {
      if (err) return reject(err);
      return resolve(res);
    });
  });
} 