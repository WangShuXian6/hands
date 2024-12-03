import React, { useRef, useEffect, useState } from "react";
import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

// 定义MediaPipe Hands返回结果的类型
interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

const GESTURE_TIMEOUT = 1000; // 设置手势触发的时间间隔，单位：毫秒
const MOVE_THRESHOLD = 0.05; // 设置手势运动的阈值

export const HandGestureRecognition = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null); // 用于视频流
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // 用于绘制手部关键点

  const [gesture, setGesture] = useState<string>(""); // 当前识别的手势
  const [lastGestureTime, setLastGestureTime] = useState<number>(0); // 上次手势触发的时间
  const [prevCoordinates, setPrevCoordinates] = useState<{ x: number; y: number } | null>(null); // 上一帧中的坐标

  // 判断手势的方向
  const detectGesture = (currentCoordinates: { x: number; y: number }) => {
    const currentTime = Date.now();

    // 如果当前时间距离上次触发时间太短，则不再触发
    if (currentTime - lastGestureTime < GESTURE_TIMEOUT) {
      return; // 时间间隔太短，忽略此次触发
    }

    if (!prevCoordinates) {
      setPrevCoordinates(currentCoordinates); // 初始化上一帧坐标
      return;
    }

    const { x: prevX, y: prevY } = prevCoordinates;
    const { x: currentX, y: currentY } = currentCoordinates;

    // 如果X或Y轴的变化大于阈值，则认为有移动
    if (Math.abs(currentY - prevY) > MOVE_THRESHOLD) {
      // Y轴变化表示上下移动
      if (currentY < prevY) {
        console.log('Move Up')
        setGesture("Move Up");
      } else {
        console.log('Move Dow')
        setGesture("Move Down");
      }
    } else if (Math.abs(currentX - prevX) > MOVE_THRESHOLD) {
      // X轴变化表示左右移动
      if (currentX < prevX) {
        console.log('Move Left')
        setGesture("Move Left");
      } else {
        console.log('Move Right')
        setGesture("Move Right");
      }
    }

    // 更新上一帧的坐标
    setPrevCoordinates(currentCoordinates);

    // 更新触发时间
    setLastGestureTime(currentTime);
  };

  useEffect(() => {
    const videoElement = videoRef.current!;
    const canvasElement = canvasRef.current!;
    const canvasCtx = canvasElement.getContext("2d")!;

    // 初始化 MediaPipe Hands 模块
    const hands = new Hands({
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
          // 获取手腕和中指尖端的位置（索引：0为手腕，8为中指尖端）
          const wrist = landmarks[0]; // 手腕位置
          const middleFingerTip = landmarks[8]; // 中指尖端位置

          // 获取坐标并调用手势识别函数
          const currentCoordinates = {
            x: middleFingerTip.x - wrist.x, // X轴的相对位置
            y: middleFingerTip.y - wrist.y, // Y轴的相对位置
          };

          detectGesture(currentCoordinates); // 检测手势
          
          // 绘制手部关键点
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
  }, [lastGestureTime, prevCoordinates]); // 添加状态作为依赖项

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <video ref={videoRef} style={{ display: "none" }} playsInline muted />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <div style={{ position: "absolute", top: 10, left: 10, color: "white", fontSize: "20px" }}>
        Gesture: {gesture}
      </div>
    </div>
  );
};
