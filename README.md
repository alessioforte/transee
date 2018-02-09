<div align="center">

![Transee](https://alessioforte.github.io/transee/assets/icon_128x128.png)

# Transee
Simple and useful tool for quick translation - reference to Google Translate

![screenshot](https://alessioforte.github.io/transee/assets/rainbow.png)

</div>


### Installation

1. Clone the git repository from GitHub:

        git clone https://github.com/alessioforte/transee.git

2. Open the working directory:

        cd transee

3. Install the Node dependencies:

        npm install

Instead of `npm install` you may also install with [yarn](https://github.com/yarnpkg/yarn).


### Running Transee

To run a development version requires a few steps. The easiest way is just to use two
terminals. One terminal can be used just to watch for changes to the code:

    npm run watch

Now run Transee in another terminal:

    npm run dev

The main process in src/main/ folder is just for development version. After `npm run dev` the bundles are created in dist/renderer/ folder

To run a distribution version open dist/ directory and install Node dependencies:

    npm install

and run:

    npm start
