const YemotApi = require("./");

(async () => {
    try {
        // יצירת מופע של ה-API
        const y = new YemotApi("YOUR_YEMOT_USERNAME", "YOUR_YEMOT_PASSWORD");

        // המרת טקסט לשמע והעלאה לימות
        const googleApiKey = "YOUR_GOOGLE_API_KEY"; // מפתח API של Google Cloud
        const text = "שלום, זוהי הודעה לדוגמה שהומרה לקובץ שמע באמצעות Google TTS API";
        
        console.log("מתחיל המרת טקסט לשמע...");
        
        const result = await y.text_to_speech(
            text,
            googleApiKey,
            "ivr/welcome.mp3", // נתיב היעד בשרת ימות
            {
                voice: "he-IL-Wavenet-D", // קול בעברית
                speed: 1.0, // מהירות דיבור רגילה
                convertAudio: 1 // המרת פורמט האודיו
            }
        );
        
        console.log("הטקסט הומר לשמע והועלה בהצלחה!");
        console.log(result.data);
        
    } catch (error) {
        console.error("שגיאה:", error.message);
    }
})();
