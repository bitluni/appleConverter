function decodeRle(bits)
{
	const rleBits = 4;
	let decoded = [];

	let currentColor = 0;
	for(let b = 0; b < bits.length; b+=rleBits)
	{
		let len = 0;
		for(let i = 0; i < rleBits; i++)
			len |= bits[b + i] << i;
		for(let i = 0; i < len; i++)
			decoded.push(currentColor);
		currentColor^=1;
		if(decoded.length % (16*15) == 0)
			currentColor = 0;
	}
	return decoded;
}

function encodeDiffRle(bits)
{
	const rleBits = 6;
	const maxLength = (1 << rleBits) - 1;
	const frameCount = bits.length / (16 * 15);
	let encoded = [];
	for(let f = 0; f < frameCount; f++)
	{
		let currentColor = 0;
		let i = (16 * 15) * f;
		let len = 0;
		for(let p = 0; p < 16 * 15; p++)
		{
			const c = f == 0 ? bits[i + p] :
								bits[i + p]^bits[i + p - 16*15];
			if(c != currentColor || len == maxLength)
			{
				for(let b = 0; b < rleBits; b++)
					encoded.push((len >> b) & 1);
				len = 1;
				currentColor = c;
			}
			else
				len++;
		}
		for(let b = 0; b < rleBits; b++)
			encoded.push((len >> b) & 1);
	}
	return encoded;			
}
