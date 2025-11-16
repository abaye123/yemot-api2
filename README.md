# yemot-api

ספריית Node.js לעבודה עם API של מערכת יומות (Call2All).

# התקנה
```bash
npm i yemot-api
```

# תיעוד הפונקציות

## מחלקה ראשית

### דרך 1: שימוש במפתח API (מומלץ)
```js
const yemot_api = require("yemot-api");
const y = new yemot_api({ apiKey: "YOUR_API_KEY_HERE" });
```

**אובייקט אפשרויות:**
- `apiKey` - מפתח API קבוע (חובה)
- `config` - אובייקט הגדרות נוספות ל-axios (אופציונלי)
- `ym_server` - שרת ימות (אופציונלי, ברירת מחדל: "ym")

### דרך 2: שימוש עם username/password (כרגע לא פעיל - בעתיד ימומש עם אימות דו-שלבי)
```js
const yemot_api = require("yemot-api");
const y = new yemot_api(username, password, config, ym_server);
```

**פרמטרים:**
- `username` - שם משתמש ביומות
- `password` - סיסמה ביומות
- `config` - אובייקט הגדרות נוספות ל-axios (אופציונלי)
- `ym_server` - שרת ימות (ברירת מחדל: "ym")

**הערה:** האפשרות להתחברות עם username/password תתמוך בעתיד גם באימות דו-שלבי.

## פונקציות המחלקה:

### `get_session()`
קבלת מספר יחידות זמינות בחשבון.
**החזרה**: Promise עם מספר היחידות.

### `upload_file(path, file, convertAudio = 0)`
העלאת קובץ לשרת ימות.
- `path` - נתיב היעד בשרת (לדוגמה: "ivr/123.txt")
- `file` - אובייקט קובץ עם שדות `value` ו-`options`
- `convertAudio` - האם להמיר קובץ אודיו לפורמט מתאים (0/1)
**החזרה**: Promise עם תוצאת ההעלאה.

### `download_file(path)`
הורדת קובץ מהשרת.
- `path` - נתיב הקובץ בשרת
**החזרה**: Promise עם תוכן הקובץ.

### `copy_files(target_path, files_path)`
העתקת קבצים בשרת.
- `target_path` - נתיב היעד
- `files_path` - מערך נתיבי קבצים להעתקה
**החזרה**: Promise עם תוצאת הפעולה.

### `move_files(target_path, files_path)`
העברת קבצים בשרת.
- `target_path` - נתיב היעד
- `files_path` - מערך נתיבי קבצים להעברה
**החזרה**: Promise עם תוצאת הפעולה.

### `delete(files_path)`
מחיקת קבצים מהשרת.
- `files_path` - מערך נתיבי קבצים למחיקה
**החזרה**: Promise עם תוצאת הפעולה.

### `create_ext(path, ini_settings_obj)`
יצירת הרחבה חדשה.
- `path` - נתיב ההרחבה
- `ini_settings_obj` - אובייקט עם הגדרות ההרחבה
**החזרה**: Promise עם תוצאת הפעולה.

### `logout()`
התנתקות מהשרת.
**החזרה**: Promise עם תוצאת ההתנתקות.

### `get_ivr_tree(path)`
קבלת עץ IVR.
- `path` - נתיב להתחלה
**החזרה**: Promise עם מבנה העץ.

### `get_incoming_calls()`
קבלת רשימת שיחות נכנסות.
**החזרה**: Promise עם רשימת השיחות.

### `run_campaign(template_id, phones, caller_id)`
הרצת קמפיין.
- `template_id` - מזהה תבנית הקמפיין
- `phones` - מערך מספרי טלפון (אופציונלי)
- `caller_id` - מזהה מתקשר (אופציונלי)
**החזרה**: Promise עם תוצאת ההרצה.

### `upload_txt_file(path, ini_settings_obj)`
העלאת קובץ טקסט.
- `path` - נתיב היעד
- `ini_settings_obj` - אובייקט או מחרוזת עם תוכן הקובץ
**החזרה**: Promise עם תוצאת ההעלאה.

## דוגמת שימוש

### שימוש עם מפתח API (מומלץ)
```js
const YemotApi = require('yemot-api');

const main = async () => {
    // אתחול עם מפתח API
    const y = new YemotApi({ apiKey: "YOUR_API_KEY_HERE" });

    // קבלת מידע על החשבון (מבצע אימות אוטומטי של המפתח)
    const session = await y.get_session();
    console.log(session.data);
    // תוצאה לדוגמה:
    // {
    //   "responseStatus": "OK",
    //   "name": "abaye",
    //   "units": 0,
    //   "unitsExpireDate": "2017-01-26",
    //   "organization": "",
    //   "contactName": "055555555",
    //   "phones": "055555555",
    //   "email": "ex@gmail.com",
    //   "username": "0777777777",
    //   "yemotAPIVersion": 6
    // }

    // העלאת קובץ
    const file = {
        value: "12345",
        options: {
            filename: "123.txt",
            contentType: "text/txt"
        }
    };
    const uploadResult = await y.upload_file("ivr/123.txt", file);
    console.log(uploadResult);

    // הורדת קובץ
    try {
        const downloadResult = await y.download_file("ivr/123.txt");
        console.log(downloadResult);
    } catch (error) {
        console.error('שגיאה בהורדת הקובץ:', error);
    }

    // יצירת שלוחה חדשה
    await y.create_ext("/1", {
        type: "menu",
        white_list: "yes"
    });

    // העלאת קובץ רשימה לבנה
    await y.upload_txt_file("/1/WhiteList.ini", [
        "0773137770",
        "055555555"
    ]);
};

main().catch(console.error);
```

### אפשרויות נוספות באתחול
```js
// אתחול עם הגדרות מותאמות אישית
const y = new YemotApi({ 
    apiKey: "YOUR_API_KEY_HERE",
    ym_server: "ym",  // או "ym2", "ym3", וכו'
    config: {
        timeout: 30000,  // הגדרות axios
        // ... הגדרות נוספות
    }
});
```
