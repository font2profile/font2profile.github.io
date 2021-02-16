const fontSuffix = [".ttf",".otf"];

function onClick() {
	const input = document.getElementById("input");
	const fonts = [...input.files].filter(isFont);
	console.log(fonts)
	if (fonts.length <= 0) {
		alert("フォントを選択してください。");
		return;
	}

	const fontXmls = [];
	const fontNames = [];
	for (let font of fonts) {
		let reader = new FileReader();
		reader.addEventListener("load",() => {
			let fontName = getFontName(font.name);
			let xml = createFontXml(reader.result,fontName);
			fontXmls.push(xml);
			fontNames.push(fontName);

			if (fonts.length == fontXmls.length) {
				let configXml = createProfileXml(fontXmls,fontNames.join("-"));
				let blob = new Blob(configXml,{ type: "text/xml" });

				let aTag = document.createElement("a");
				aTag.innerText = "download";
				aTag.download = "font.mobileconfig";
				aTag.href = window.URL.createObjectURL(blob);
				// window.open(url,"_blank");
				aTag.target = "_blank";
				document.getElementById("form").appendChild(aTag)
				// aTag.click();
				// window.URL.revokeObjectURL(aTag.href);
			}
		});
		reader.readAsDataURL(font);
	}
}

const isFont = (font) => {
	if (fontSuffix.some(s => font.name.endsWith(s))) {
		return true;
	}
	return false;
}

const getFontName = (fontName) => {
	return fontName.slice(0,-4);
}

const createFontXml = (fontData,fontName) => {
	return formatFontData({
		data: fontData.split(",")[1],
		name: fontName,
		identifier: uuidv4().toUpperCase(),
	});
}

const createProfileXml = (fonts,name) => {
	return formatProfileData({
		content: fonts.join("\n"),
		name: name || "Fonts",
		identifier: uuidv4().toUpperCase(),
		uuid: uuidv4().toUpperCase()
	});
}

const template = (strings,...keys) => {
	return (...values) => {
		const dict = values[values.length - 1] || {};
		const result = [strings[0]];
		keys.forEach((key,i) => {
			const value = (Number.isInteger(key) ? values : dict)[key];
			result.push(value,strings[i + 1]);
		});
		return result.join("");
	};
}

const formatFontData = template`<dict>
	<key>Font</key>
	<data>${"data"}</data>
	<key>Name</key>
	<string>${"name"}</string>
	<key>PayloadIdentifier</key>
	<string>io.github.font2profile.${"identifier"}</string>
	<key>PayloadType</key>
	<string>com.apple.font</string>
	<key>PayloadUUID</key>
	<string>${"identifier"}</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>`;

const formatProfileData = template`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
	<dict>
		<key>PayloadContent</key>
		<array>${"content"}</array>
		<key>PayloadDescription</key>
		<string>Generated by font2profile.github.io</string>
		<key>PayloadDisplayName</key>
		<string>${"name"}</string>
		<key>PayloadIdentifier</key>
		<string>io.github.font2profile.${"identifier"}</string>
		<key>PayloadOrganization</key>
		<string>font2profile</string>
		<key>PayloadType</key>
		<string>Configuration</string>
		<key>PayloadUUID</key>
		<string>${"uuid"}</string>
		<key>PayloadVersion</key>
		<integer>1</integer>
	</dict>
</plist>`;
