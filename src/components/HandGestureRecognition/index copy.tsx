import React, { useRef, useEffect } from "react";
import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

// 定义MediaPipe Hands返回结果的类型
interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export const HandGestureRecognition = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null); // 用于视频流
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // 用于绘制手部关键点

  useEffect(() => {
    const videoElement = videoRef.current!;
    const canvasElement = canvasRef.current!;
    const canvasCtx = canvasElement.getContext("2d")!;

    // 初始化 MediaPipe Hands 模块
    const hands = new Hands({
      //locateFile: (file: string) =>
        //`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      locateFile: (file: string) => `/mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2, // 最多检测2只手
      modelComplexity: 1, // 模型复杂度，1表示较快，0表示较精确
      minDetectionConfidence: 0.7, // 最小检测置信度
      minTrackingConfidence: 0.5, // 最小跟踪置信度
    });

    // 当 MediaPipe Hands 模型识别结果返回时的回调函数
    hands.onResults((results: Results) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height); // 清空画布

      // 绘制视频图像到画布
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      if (results.multiHandLandmarks) {
        // 遍历手部标志点
        results.multiHandLandmarks.forEach((landmarks: HandLandmark[]) => {
          landmarks.forEach((landmark: HandLandmark) => {
            const x = landmark.x * canvasElement.width; // 标志点X坐标
            const y = landmark.y * canvasElement.height; // 标志点Y坐标
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 5, 0, 2 * Math.PI); // 绘制圆圈表示标志点
            canvasCtx.fillStyle = "blue"; // 设置颜色
            canvasCtx.fill();
          });
        });
      }
      canvasCtx.restore();
    });

    // 初始化视频摄像头并开始捕获视频流
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 640, // 设置视频宽度
      height: 480, // 设置视频高度
      facingMode: "user", // 前置摄像头
    });

    // 启动摄像头
    camera.start();

    return () => {
      camera.stop(); // 清理工作
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <video ref={videoRef} style={{ display: "none" }} playsInline muted />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
};
