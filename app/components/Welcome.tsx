"use client";
import React from "react";

export function Welcome() {
	return (
		<>
			<h1 className="relative z-20 text-center text-3xl font-bold md:text-3xl lg:text-4xl">
				Welcome to Tubesleuth
			</h1>
			<div className="relative h-40 w-[40rem]">
				{/* Gradients */}
				<div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
				<div className="absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
				<div className="absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
				<div className="absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

				{/* Radial Gradient to prevent sharp edges */}
				<div className="absolute inset-0 size-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
			</div>
		</>
	);
}
