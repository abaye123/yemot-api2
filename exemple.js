const yemot_api = require("./");

(async () => {

	// Method 1: Default - Using system number + API key (recommended)
	// By default, the second parameter is treated as API key
	const y = new yemot_api("0773137770", "YOUR_API_KEY_HERE");
	
	// Method 2: Using null + API key (without system number validation)
	// const y = new yemot_api(null, "YOUR_API_KEY_HERE");
	
	// Method 3: Using object syntax with API key
	// const y = new yemot_api({ 
	//     apiKey: "YOUR_API_KEY_HERE",
	//     systemNumber: "0773137770" 
	// });
	
	// Method 4: Using object syntax - API key only (without system number validation)
	// const y = new yemot_api({ apiKey: "YOUR_API_KEY_HERE" });
	
	// Method 5: Using username and password with 2FA - pass true as third parameter
	// const y = new yemot_api("0773137770", "1234", true);
	
	// Method 6: Using username and password with 2FA - using config object
	// const y = new yemot_api("0773137770", "1234", { use2FA: true });

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
