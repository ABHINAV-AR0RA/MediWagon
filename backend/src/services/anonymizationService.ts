export function anonymizeData(symptoms: string): string
{
	let text = symptoms.toLowerCase();

	// Remove names, numbers, email, address patterns, etc.
	text = text.replace(/\b([A-Z][a-z]+)\b/g, '[REDACTED]');
	text = text.replace(/\d+/g, '[NUM]');
	text = text.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g, '[EMAIL]');
	text = text.replace(/(street|road|city|block|avenue)/gi, '[LOCATION]');

	return text;
}
