const startBtn = document.getElementById("start-btn");

let mediaRecorder;
let audioChunks = [];

startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const text = await transcribeAudio(audioBlob);
      handleUserCommand(text);
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 4000);

  } catch (err) {
    alert("تعذّر الوصول للميكروفون");
  }
});

async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append("model", "nova-2-sonic");
    formData.append("audio", audioBlob, "recording.webm");

    const res = await fetch("https://api.amazon.com/nova/v1/invoke", {
      method: "POST",
      headers: {
        Authorization: `Bearer YOUR_API_KEY_HERE`,
      },
      body: formData,
    });

    const data = await res.json();
    return data.text || "لم يتم التعرف على الصوت";

  } catch (error) {
    return "حدث خطأ أثناء تحويل الصوت إلى نص";
  }
}

function handleUserCommand(text) {
  console.log("User said:", text);

  if (text.includes("الوقت")) {
    speak("الوقت الآن هو " + new Date().toLocaleTimeString("ar-SA"));
  }

  else if (text.includes("مرحبا")) {
    speak("أهلاً! كيف أقدر أساعدك اليوم؟");
  }

  else {
    speak("لم أفهم الأمر. هل يمكنك إعادة المحاولة؟");
  }
}

function speak(message) {
  const utter = new SpeechSynthesisUtterance(message);
  utter.lang = "ar-SA";
  speechSynthesis.speak(utter);
}
