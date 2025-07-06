import { app, BrowserWindow, ipcMain } from 'electron';

console.log('Test main file loaded');

ipcMain.handle('test-handler', async () => {
  console.log('Test handler called');
  return 'test-response';
});

ipcMain.handle('db:saveVideoProgress', async (_event, filePath: string, currentTime: number, duration: number, watched: boolean) => {
  console.log('🔄 Test saveVideoProgress called:', { filePath, currentTime, duration, watched });
  return { success: true };
});

app.whenReady().then(() => {
  console.log('App ready');
}); 