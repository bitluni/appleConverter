function encodeDiffQuad(bits, stats)
{
	//quadtree
	const xres = 16;
	const yres = 15;
	const frameCount = bits.length / (xres * yres);
	let encoded = [];
	const bitsd = diff(xres, yres, bits);
	
	function r(x, y, s, bits, offset, pixCount, frame)
	{
		if(s == 1)
		{
			if(x > xres || y > yres) return [0];
			const p = y * xres + x;
			pixCount[0] = bits[offset + p];
			return [bits[offset + p]];
		}
		const hs = s / 2;
		const c0 = [0];
		const c1 = [0];
		const c2 = [0];
		const c3 = [0];
		const bit0 = r(x, y, hs, bits, offset, c0, frame);
		const bit1 = r(x + hs, y, hs, bits, offset, c1, frame);
		const bit2 = r(x, y + hs, hs, bits, offset, c2, frame);
		const bit3 = r(x + hs, y + hs, hs, bits, offset, c3, frame);
		const cTotal = c0[0] + c1[0] + c2[0] + c3[0];
		
		//if(false)
		if(s == 8 && cTotal > 0 && 
			(
				((frame & 3) == 0 && cTotal <= 0)||
				((frame & 3) != 0 && cTotal <= 16)
			))
		{
			//TODO update diffImage
			//if(!last)
			for(let j = 0; j < s; j++)
				for(let i = 0; i < s; i++)	
				if(y + j < yres)
				{
					const p = offset + x + i + (y + j) * xres;
					bits[p + xres * yres]^=bits[p];
				}
			return [0];
		}

		if(bit0[0] | bit1[0] | bit2[0] | bit3[0]) 
		{
			if(stats)
			{
				const ind = bit0[0] | (bit1[0] << 1) | (bit2[0] << 2) | (bit3[0] << 3);
				stats[ind]++;
			}
			let r = [1];
				r.push(...bit0);
			if(x + hs < xres) 
				r.push(...bit1);
			if(y + hs < yres) 
				r.push(...bit2);
			if(y + hs < yres && x + hs < xres) 
				r.push(...bit3);
			pixCount[0] = cTotal;
			return r;
		}
		if(stats)
			stats[0]++;
		pixCount[0] = 0;
		return [0];
	}

	for(let f = 0; f < frameCount; f++)
	{
		let i = (16 * 15) * f;
		const bit = r(0, 0, 16, bitsd, i, [0], f);
		encoded = encoded.concat(bit);
	}
	return encoded;
}

function decodeDiffQuad(bits)
{
	//quadtree
	const xres = 16;
	const yres = 15;
	let decoded = [];
	let offset = 0;
	function r(x, y, s, bits, dec)
	{
		if(y >= yres && s == 1) return;
		if(!bits[offset++]) return;
		if(s == 1)
		{
			if(x < xres && y < yres)
				dec[x + y * 16] = 1;
			return;
		}
		else
		{
			const sh = s >> 1;
			r(x, y, sh, bits, dec);
			if(x + sh < xres) r(x + sh, y, sh, bits, dec);
			if(y + sh < xres) r(x, y + sh, sh, bits, dec);
			if(x + sh < xres && y + sh < yres) r(x + sh, y + sh, sh, bits, dec);
		}
	}
	while(offset < bits.length)
	{
		let dec = new Array(16*15).fill(0);
		r(0, 0, 16, bits, dec);
		decoded.push(...dec);
	}
	return undiff(16,15, decoded);
}
