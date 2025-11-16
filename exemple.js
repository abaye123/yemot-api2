const yemot_api = require("./");

(async () => {

	// Method 1: Using API key (recommended)
	const y = new yemot_api({ apiKey: "YOUR_API_KEY_HERE" });
	
	// Method 2: Using username and password (for future use with 2FA)
	// const y = new yemot_api("0773137770", "1234");

	// Get account units and information
	let r = await y.get_session();

	console.log(r.data);

	// Upload file
	const file = {
		value: "12345",
		options: {
			filename: "123.txt",
			contentType: "text/txt"
		}
	};

	await y.upload_file("ivr/123.txt", file);

	// Download file
	try {
		r = await y.download_file("ivr/123.txt");
	} catch (error) {
		console.error(error);
	}

	console.log(r);

	// Create new extension
	await y.create_ext("/1", {
		type: "menu",
		white_list: "yes"
	});

	await y.upload_txt_file(str_path + "/1/WhiteList.ini", [
        "0773137770"
    ]);

})();
