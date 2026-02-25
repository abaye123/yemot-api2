const axios = require("axios").default;
const qs = require("qs");
const FormData = require("form-data");

const { ini_from_obj } = require("./ulit");

/**
 * Initialize Yemot API client
 * @param {string|object} systemNumberOrOptions - System number (for API key auth) or object with apiKey
 * @param {string} apiKeyOrPassword - API key (default) or password (if use2FA is true)
 * @param {import("axios").AxiosRequestConfig|boolean} configOrUse2FA - Axios configuration or boolean for 2FA mode
 * @param {string} ym_server - Yemot server identifier (default: "ym")
 */
function Yemot_api(systemNumberOrOptions, apiKeyOrPassword, configOrUse2FA = {}, ym_server = "ym") {

	let token;
	let is_connect = false;
	let apiKey = null;
	let username = null;
	let password = null;
	let expectedSystemNumber = null;
	let use2FA = false;
	let config = {};
	
	// Handle different initialization modes
	if (typeof systemNumberOrOptions === 'object' && systemNumberOrOptions.apiKey) {
		// Object mode: { apiKey: "...", systemNumber: "...", config: {...}, ym_server: "..." }
		apiKey = systemNumberOrOptions.apiKey;
		token = apiKey;
		if (systemNumberOrOptions.systemNumber) {
			expectedSystemNumber = systemNumberOrOptions.systemNumber;
			console.log('[Yemot API] Initialization: Object mode with API key and system number validation');
		} else {
			console.log('[Yemot API] Initialization: Object mode with API key (no system number validation)');
		}
		if (systemNumberOrOptions.config) {
			config = { ...systemNumberOrOptions.config };
		}
		if (systemNumberOrOptions.ym_server) {
			ym_server = systemNumberOrOptions.ym_server;
		}
	} else if (typeof systemNumberOrOptions === 'string' || systemNumberOrOptions === null) {
		// String or null mode: determine if API key or 2FA based on third parameter
		if (typeof configOrUse2FA === 'boolean') {
			// Third parameter is boolean - indicates 2FA mode
			use2FA = configOrUse2FA;
			if (use2FA) {
				// 2FA mode: username + password
				username = systemNumberOrOptions;
				password = apiKeyOrPassword;
				console.log('[Yemot API] Initialization: 2FA mode with username and password');
			} else {
				// API key mode (explicit false)
				expectedSystemNumber = systemNumberOrOptions;
				apiKey = apiKeyOrPassword;
				token = apiKey;
				if (expectedSystemNumber) {
					console.log('[Yemot API] Initialization: API key mode with system number validation');
				} else {
					console.log('[Yemot API] Initialization: API key mode (no system number validation)');
				}
			}
		} else if (typeof configOrUse2FA === 'object') {
			// Third parameter is config object - check if use2FA is specified
			config = { ...configOrUse2FA };
			if (configOrUse2FA.use2FA === true) {
				// 2FA mode: username + password
				use2FA = true;
				username = systemNumberOrOptions;
				password = apiKeyOrPassword;
				console.log('[Yemot API] Initialization: 2FA mode with username and password (via config)');
			} else if (configOrUse2FA.useApiKey === true) {
				// API key mode when explicitly specified
				expectedSystemNumber = systemNumberOrOptions;
				apiKey = apiKeyOrPassword;
				token = apiKey;
				if (expectedSystemNumber) {
					console.log('[Yemot API] Initialization: API key mode with system number validation (explicit)');
				} else {
					console.log('[Yemot API] Initialization: API key mode (no system number validation)');
				}
			} else {
				// Default when config object but no mode specified: username/password
				use2FA = true;
				username = systemNumberOrOptions;
				password = apiKeyOrPassword;
				console.log('[Yemot API] Initialization: Username/password mode (default with config)');
			}
		} else {
			// Default behavior when third parameter is undefined: username/password mode (backward compatibility)
			use2FA = true;
			username = systemNumberOrOptions;
			password = apiKeyOrPassword;
			console.log('[Yemot API] Initialization: Username/password mode (default - backward compatible)');
		}
	}

	const yemot_con = axios.create({
		baseURL: `https://www.call2all.co.il/${ym_server}/api/`,
		maxContentLength: Infinity,
		...config
	});
	
	let apiKeyValidationPromise = null;
	
	if (apiKey) {
		apiKeyValidationPromise = (async () => {
			try {
				const sessionRes = await execDirect("GetSession", { token: apiKey });
				if (sessionRes.data && sessionRes.data.responseStatus === "OK") {
					// Validate system number if provided
					if (expectedSystemNumber && sessionRes.data.username !== expectedSystemNumber) {
						throw new Error(`System number mismatch: expected ${expectedSystemNumber}, but got ${sessionRes.data.username}`);
					}
					is_connect = true;
				}
			} catch (error) {
				console.error("API key authentication error:", error.message);
				throw error;
			}
		})();
	}

	this.get_token = async () => {
		if (!is_connect) {
			if (apiKey && apiKeyValidationPromise) {
				// Wait for API key validation to complete
				await apiKeyValidationPromise;
			} else if (!apiKey) {
				// Only call login if we're using username/password
				await login();
			}
		}
		return token;
	};

	this.copy_files = async (target_path, files_path) => {

		return exec("FileAction", {
			action: "copy",
			target: "ivr2:" + target_path,
			...make_what_files(files_path)
		});
	};

	this.move_files = async (target_path, files_path) => {

		return exec("FileAction", {
			action: "move",
			target: "ivr2:" + target_path,
			...make_what_files(files_path)
		});
	};

	this.delete = async (files_path) => {
		return exec("FileAction", {
			action: "delete",
			...make_what_files(files_path)
		});
	};

	this.create_ext = async (path, ini_settings_obj) => {

		await exec("UpdateExtension", {
			path: "ivr2:/" + path,
		});

		return upload_txt_file(path + "/ext.ini", ini_settings_obj);
	};

	this.checkIfFolderExists = async (path) => {

		return exec("CheckIfFolderExists", {
			path: "ivr2:/" + path,
		});
	};

	this.logout = () => {
		return exec("Logout");
	};

	this.upload_file = (path, file, convertAudio = 0) => {

		return exec("UploadFile", {
			path,
			convertAudio,
			file
		});
	};

	this.download_file = (path) => {

		return exec("DownloadFile", {
			path: "ivr2:" + path
		});
	};

	this.get_ivr_tree = (path) => {
		return exec("GetIvrTree", {
			path: "ivr2:" + path
		});
	};

	this.getIvrDir = (path, options = {}) => {
		const params = {
			path: "ivr2:" + path
		};

		if (options.filesFrom !== undefined) {
			params.filesFrom = options.filesFrom;
		}

		if (options.filesLimit !== undefined) {
			params.filesLimit = options.filesLimit;
		}

		if (options.orderBy !== undefined) {
			params.orderBy = options.orderBy;
		}

		if (options.orderDir !== undefined) {
			params.orderDir = options.orderDir;
		}

		return exec("GetIVR2Dir", params);
	};

	this.getIvrDirStats = (path) => {
		return exec("GetIVR2DirStats", {
			path: "ivr2:" + path
		});
	};

	this.getTextFile = (path) => {
		return exec("GetTextFile", {
			what: "ivr2:" + path
		});
	};

	this.get_incoming_calls = () => {
		return exec("GetIncomingCalls");
	}

	this.get_session = () => {
		return exec("GetSession");
	};

	this.run_campaign = (template_id, phones = false, caller_id = false) => {

		const param = {
			templateId: template_id
		};

		if (phones && Array.isArray(phones)) {
			param.phones = phones.join(":");
		}

		if (caller_id) {
			param.callerId = caller_id;
		}

		return exec("RunCampaign", param);
	};

	this.exec = exec;

	this.upload_txt_file = upload_txt_file;

	async function upload_txt_file(path, ini_settings_obj) {

		if (typeof ini_settings_obj === "object") {

			if (Array.isArray(ini_settings_obj)) {
				ini_settings_obj = ini_settings_obj.join("\n");
			} else {
				ini_settings_obj = ini_from_obj(ini_settings_obj);
			}
		}

		return exec("UploadTextFile", {
			what: "ivr2:/" + path,
			contents: ini_settings_obj
		});

	}

	/**
	 * Internal function to execute direct API call without auto-initialization
	 */
	async function execDirect(method, parameters = {}, options = {}) {
		let data;
		
		if (method !== "Login") {
			parameters.token = token;
		}

		if (method === "UploadFile") {
			const form = new FormData();
			for (const parameter of Object.entries(parameters)) {
				if (typeof parameter[1] == "object") {
					form.append(parameter[0], parameter[1].value, parameter[1].options);
				} else {
					form.append(parameter[0], parameter[1]);
				}
			}
			options.headers = form.getHeaders();
			data = form.getBuffer();
		} else {
			if (method === "DownloadFile") {
				options.responseType = options.responseType || "arraybuffer";
			}
			options.headers = { "Content-Type": "application/x-www-form-urlencoded" };
			data = qs.stringify(parameters);
		}
		
		return await yemot_con.post(method, data, options);
	}

	/**
	 * Execute API method
	 * @param {string} method - API method name
	 * @param {object} parameters - Method parameters
	 * @param {import("axios").AxiosRequestConfig} options - Axios options
	 * @returns {promise} API response promise
	 */
	async function exec(method, parameters = {}, options = {}) {

		if (!is_connect && method !== "Login" && method !== "GetSession") {
			if (apiKey) {
				try {
					const sessionRes = await execDirect("GetSession", {});
					if (sessionRes.data && sessionRes.data.responseStatus === "OK") {
						// Validate system number if provided
						if (expectedSystemNumber && sessionRes.data.username !== expectedSystemNumber) {
							throw new Error(`System number mismatch: expected ${expectedSystemNumber}, but got ${sessionRes.data.username}`);
						}
						is_connect = true;
					} else {
						throw new Error("Invalid API key");
					}
				} catch (error) {
					throw new Error("Invalid API key: " + error.message);
				}
			} else {
				await login();
			}
		}

		let data = make();

		try {
			let res = await yemot_con.post(method, data, options);

			if (res.data.responseStatus && res.data.responseStatus !== "OK") {
				// Special case for CheckIfFolderExists where ERROR with folderExists is valid
				if (method === "CheckIfFolderExists" && res.data.folderExists !== undefined) {
					return res;
				}

				if (
					(res.data.responseStatus === "EXCEPTION" &&
						res.data.message ===
						"IllegalStateException(session token is invalid)") ||
					(res.data.responseStatus === "FORBIDDEN" &&
						res.data.message ===
						"session is expired")
				) {

					return await session_is_expired();
				}

				let message;
				if (res.data.exceptionMessage) {
					message = res.data.exceptionMessage;
				} else if (res.data.message) {
					message = res.data.message;
				}

				const error = new Error(message);

				error.response = res;
				error.request = res.request;
				error.config = res.config;

				throw error;
			}

			return res;


		} catch (error) {

			if (error.response) {
				if (error.response.status == 404 &&
					method === "DownloadFile") {
					throw (error.response.data);

				}
			}

			throw error;
		}

		async function session_is_expired() {
			if (apiKey) {
				throw new Error("Invalid or expired API key");
			}
			
			await login();

			return exec(method, parameters, options);
		}

		function make() {
			if (method !== "Login") {

				parameters.token = token;
			}

			let data;

			if (method === "UploadFile") {

				const form = new FormData();

				for (const parameter of Object.entries(parameters)) {

					if (typeof parameter[1] == "object") {
						form.append(parameter[0], parameter[1].value, parameter[1].options);
					} else {
						form.append(parameter[0], parameter[1]);
					}
				}

				options.headers = form.getHeaders();
				data = form.getBuffer();

			} else {

				if (method === "DownloadFile") {
					options.responseType = options.responseType || "arraybuffer";
				}

				options.headers = { "Content-Type": "application/x-www-form-urlencoded" };

				data = qs.stringify(parameters);
			}
			return data;
		}
	}

	async function login() {

		const parm = { username, password };

		const res = await exec("Login", parm);

		if (res.data && res.data.responseStatus !== "OK") {

			throw (res.data.responseStatus + ": " + res.data.message);
		}

		token = res.data.token;

		is_connect = true;
	}

	function make_what_files(files) {
		const final_files = {};
		let i = 0;
		for (const file of files) {
			final_files["what" + i] = "ivr2:" + file;
			i++;
		}
		return final_files;
	}
}

Yemot_api.Yemot_api = Yemot_api;

module.exports = Yemot_api;
