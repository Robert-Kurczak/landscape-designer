# Terrain generator
Tool for operating on procedural generated, one or two dimensional height maps and terrains, with option to export them to 3D model.
The project was created as part of learning algorithms for procedural content generation, developing JavaScript skills and creating an interface for the end user.

## Table of Contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [Sources](#sources)

## General info
The tool is a local website, build with HTML, CSS and JavaScript. It's operation is based on generating pseudo random numbers and using simplified version of Perlin Noise to make them look more "natural". Generated values then, are being draw on screen as a 1D plot or 2D plane. End user can manipulate given results using built interface with variety of options, which supports operating on multiple layers. Each layer stores separate terrain with manipulatable settings for it. Website uses localStorage to save work so, refreshing page or even rebooting computer won't cause work loss.

#### Why aproximation of Perlin Noise instead of normal Perlin Noise or OpenSimplex Noise?
I wanted to try myself and implement algorythm on my own rather than using ready-made library. I used the OneLoneCoder idea (see "Sources" section below for all credits and links).

## Technologies
 1. JavaScript (ECMAScript® 2021)
    * [seedrandom.js](https://github.com/davidbau/seedrandom) (release 3.0.5)
    * Three.js (r128)
 3. HTML5
 4. CSS

## Setup
Just download all files and run index.html

## Sources
1. [OneLoneCoder / javidx9](https://github.com/OneLoneCoder)'s video ["Programming Perlin-like Noise (C++)"](https://www.youtube.com/watch?v=6-0UaeJBumA)
