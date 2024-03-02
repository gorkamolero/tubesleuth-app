const convertStructure = (data: any) => {
	return {
		action: "audio-transcribe",
		retval: {
			status: true,
			wonid: `octo:${data.id}`, // Assuming the wonid is formed by prefixing 'octo:' to the original id
			punct: data.text, // Directly taking the complete text as the punctuated transcript
			words: data.words.map((word: any) => ({
				start: word.start / 1000, // Convert start time from milliseconds to seconds
				confidence: word.confidence,
				end: word.end / 1000, // Convert end time from milliseconds to seconds
				word: word.text, // The original word text
				punct: word.text, // Assuming the punctuated word is the same as the original text
				index: data.words.indexOf(word), // Index of the word in the array
			})),
		},
	};
};
