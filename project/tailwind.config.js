/** @type {import('tailwindcss').Config} */
module.exports = {
    // Modos de conteúdo onde o Tailwind vai aplicar suas classes utilitárias
    content: [
      "./index.html", // se o seu HTML estiver na raiz
      "./src/**/*.{html,js}", // se os arquivos HTML e JS estiverem na pasta src
    ],
    theme: {
      extend: {
        // Você pode adicionar suas próprias cores, fontes e outras configurações aqui
        colors: {
          customBlue: '#3498db', // exemplo de cor personalizada
          customGreen: '#2ecc71', // outra cor personalizada
        },
        fontFamily: {
          sans: ['Arial', 'sans-serif'], // exemplo de fonte personalizada
        },
        spacing: {
          128: '32rem', // exemplo de espaçamento personalizado
        },
      },
    },
    plugins: [],
  }
  