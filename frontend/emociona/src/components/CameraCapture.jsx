import React, { useRef, useState, useEffect } from "react";

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    if (isCameraActive) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          } else {
            console.error("El elemento <video> no está disponible.");
          }
        } catch (error) {
          console.error("Error al acceder a la cámara:", error);
        }
      };

      startCamera();
    }

    // Detener la cámara cuando el componente se desmonte
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png"); // Captura la imagen como base64
    onCapture(imageData); // Devuelve la imagen capturada al componente principal
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraActive(false);
    onClose();
  };

  return (
    <div style={{ textAlign: "center" }}>
      {!isCameraActive ? (
        <button onClick={() => setIsCameraActive(true)}>Activar Cámara</button>
      ) : (
        <>
          <video ref={videoRef} style={{ width: "100%", maxWidth: "400px" }} />
          <div>
            <button onClick={capturePhoto}>Capturar Foto</button>
            <button onClick={stopCamera}>Cerrar Cámara</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraCapture;