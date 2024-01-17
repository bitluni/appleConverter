function encodeDiffOct(bits)
{
	const xres = 16;
	const yres = 15;
	const bitsd = diff(xres, yres, bits);
	const frameCount = bits.length / (xres * yres);
	let encoded = [];
	function r(x, y, z, s, bits, offset, zres)
	{
		if(s == 1)
		{
			if(x > xres || y > yres || z > zres) return [0];
			const p = y * xres + x + xres * yres * z;					
			return [bitsd[offset + p]];
		}
		const hs = s >> 1;
		const bit0 = r(x, y, z, hs, bits, offset, zres);
		const bit1 = r(x + hs, y, z, hs, bits, offset, zres);
		const bit2 = r(x, y + hs, z, hs, bits, offset, zres);
		const bit3 = r(x + hs, y + hs, z, hs, bits, offset, zres);
		const bit4 = r(x, y, z + hs, hs, bits, offset, zres);
		const bit5 = r(x + hs, y, z + hs, hs, bits, offset, zres);
		const bit6 = r(x, y + hs, z + hs, hs, bits, offset, zres);
		const bit7 = r(x + hs, y + hs, z + hs, hs, bits, offset, zres);
		if(bit0[0] | bit1[0] | bit2[0] | bit3[0] | bit4[0] | bit5[0] | bit6[0] | bit7[0]) 
		{
			let r = [1];
			r.push(...bit0);
			if(x + hs < xres)
				r.push(...bit1);
			if(y + hs < yres)
			{
				if(x + hs < xres)
					r.push(...bit2);
				r.push(...bit3);
			}
			if(z + hs < zres)
			{
				if(x + hs < xres)
					r.push(...bit4);
				r.push(...bit5);
				if(y + hs < yres)
				{
					if(x + hs < xres)
						r.push(...bit6);
					r.push(...bit7);
				}
			}
			return r;
		}
		return [0];
	}

	for(let f = 0; f < frameCount - 15; f+=16)
	{
		let i = (16 * 15) * f;
		const zres = 16;//f + 16 <= frameCount ? 16 : frameCount - f;
		const bit = r(0, 0, 0, 16, bits, i, zres);
		encoded.push(...bit);
	}
	return encoded;
}

function decodeDiffOct(bits)
{
	const xres = 16;
	const yres = 15;
	const zres = 16;
	let decoded = [];
	let offset = 0;
	function r(x, y, z, s, bits, dec)
	{
		if((x >= xres || y >= yres || z >= zres) && s == 1) return;
		if(!bits[offset++]) return;
		if(s == 1)
		{
			if(x < xres && y < yres)
				dec[z * (xres * yres) + x + y * xres] = 1;
			return;
		}
		else
		{
			const sh = s >> 1;
			r(x, 		y, 		z, 		sh, bits, dec);
			r(x + sh, 	y, 		z, 		sh, bits, dec);
			r(x, 		y + sh, z, 		sh, bits, dec);
			r(x + sh, 	y + sh, z, 		sh, bits, dec);
			r(x, 		y, 		z + sh, sh, bits, dec);
			r(x + sh, 	y, 		z + sh, sh, bits, dec);
			r(x, 		y + sh, z + sh, sh, bits, dec);
			r(x + sh, 	y + sh, z + sh, sh, bits, dec);
		}
	}
	while(offset < bits.length)
	{
		let dec = new Array(16*16*15).fill(0);
		r(0, 0, 0, 16, bits, dec);
		decoded.push(...dec);
	}
	return undiff(16, 15, decoded);
}
