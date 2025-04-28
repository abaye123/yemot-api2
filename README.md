# yemot-api

# install
```bash
npm i yemot-api
```

# תיעוד הפונקציות

## מחלקה ראשית
```js
const yemot_api = require("yemot-api");
const y = new yemot_api(username, password, config, ym_server);
```

### פרמטרים:
- `username` - שם משתמש ביומות
- `password` - סיסמה ביומות
- `config` - אובייקט הגדרות נוספות ל-axios (אופציונלי)
- `ym_server` - שרת ימות (ברירת מחדל: "ym")

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
```js
import YemotApi from 'yemot-api';

const main = async () => {
    const y = new YemotApi("0773137770", "1234");

    // קבלת מספר יחידות
    let session = await y.get_session();
    console.log(session);

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
};

main().catch(console.error);
```
