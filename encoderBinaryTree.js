function encodeDiffBi(bits)
{
	//quadtree
	const xres = 16;
	const yres = 15;
	const frameCount = bits.length / (xres * yres);
	let encoded = [];
	function r(x, y, sx, sy, bits, offset, first)
	{
		if(sx == 1 && sy == 1)
		{
			if(x > xres || y > yres) return 0;
			const p = y * xres + x;
			const bit = first ? bits[offset + p] :
								bits[offset + p]^bits[offset + p - xres*yres];					
			return bit;
		}
		if(sx > sy)
		{
			const hsx = sx / 2;
			const bit0 = r(x, y, hsx, sy, bits, offset, first);
			const bit1 = r(x + hsx, y, hsx, sy, bits, offset, first);
			if(bit0 | bit1) 
			{
				encoded.push(1);
				encoded.push(bit0);
				if(x + hsx < xres) encoded.push(bit1);
				return 1;
			}
		}
		else
		{
			const hsy = sy / 2;
			const bit0 = r(x, y, sx, hsy, bits, offset, first);
			const bit1 = r(x, y + hsy, sx, hsy, bits, offset, first);
			if(bit0 | bit1) 
			{
				encoded.push(1);
				encoded.push(bit0);
				if(y + hsy < yres) encoded.push(bit1);
				return 1;
			}
		}
		return 0;
	}

	for(let f = 0; f < frameCount; f++)
	{
		let i = (16 * 15) * f;
		const bit = r(0, 0, 16, 16, bits, i, f==0);
		encoded.push(bit);
	}
	return encoded;
}
