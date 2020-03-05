# caucus-app

## Project setup
```sh
# install dependencies
npm install

# copy necessary environment variables
cp .env.sample .env
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Run your unit tests
```
npm run test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Technical summary

### JavaScript
The Caucus App is a web app built with [Vue](https://vuejs.org/v2/guide/) using the [Vue CLI](https://cli.vuejs.org/guide/). Other commonly used third-party libraries include:

* [axios](https://github.com/axios/axios) - for making HTTP requests
* [date-fns](https://date-fns.org/v2.6.0/docs/) - for date manipulation
* [lodash](https://lodash.com/docs/) - for utility functions

Coding conventions are enfroced with [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/), using Vue's recommended linting rules..

### CSS and Component Styling

The primary component styling solution being used is [Tailwind CSS](https://tailwindcss.com/docs/).

Coding conventions are enforced with [Prettier](https://prettier.io/) and [Stylelint](https://stylelint.io/).
