import './style.css'
import { marked } from 'marked'
import Prism from 'prismjs'

// Initialize chat interface
const app = document.querySelector('#app')

// Create chat UI
app.innerHTML = `
  <div class="header">
    <h1>Danzin IA</h1>
    <p>Seu assistente virtual inteligente</p>
  </div>
  <div class="chat-container" id="chatContainer"></div>
  <div class="input-container">
    <input 
      type="text" 
      id="userInput" 
      placeholder="Digite sua mensagem aqui..."
      aria-label="Campo de mensagem"
    >
    <button id="sendButton">Enviar</button>
  </div>
`

const chatContainer = document.getElementById('chatContainer')
const userInput = document.getElementById('userInput')
const sendButton = document.getElementById('sendButton')

// Knowledge base for different topics
const knowledgeBase = {
  greetings: {
    patterns: ['olá', 'oi', 'hey', 'bom dia', 'boa tarde', 'boa noite'],
    responses: [
      "Olá! Como posso ajudar você hoje?",
      "Oi! É um prazer conversar com você. Como posso ser útil?",
      "Olá! Estou aqui para ajudar com qualquer pergunta que você tiver."
    ]
  },
  science: {
    patterns: ['ciência', 'física', 'química', 'biologia', 'universo', 'teoria'],
    responses: [
      "Esse é um tópico fascinante da ciência! Vou explicar em detalhes...",
      "Do ponto de vista científico, podemos analisar isso de várias maneiras...",
      "A ciência nos mostra que este fenômeno pode ser explicado por..."
    ]
  },
  technology: {
    patterns: ['tecnologia', 'computador', 'programação', 'software', 'hardware', 'internet'],
    responses: [
      "Na área de tecnologia, este é um conceito importante porque...",
      "Do ponto de vista técnico, podemos entender isso como...",
      "A tecnologia por trás disso é bastante interessante..."
    ]
  },
  philosophy: {
    patterns: ['filosofia', 'existência', 'consciência', 'ética', 'moral'],
    responses: [
      "Filosoficamente falando, podemos analisar esta questão sob diferentes perspectivas...",
      "Essa é uma questão filosófica profunda que nos faz refletir sobre...",
      "Do ponto de vista filosófico, existem várias escolas de pensamento que abordam isso..."
    ]
  }
}

// Common code errors and solutions database
const codeErrors = {
  javascript: {
    'ReferenceError': {
      patterns: ['is not defined', 'cannot access before initialization'],
      solutions: [
        "Este erro ocorre quando você tenta usar uma variável que não foi declarada. Verifique se você:\n\n" +
        "1. Declarou a variável antes de usá-la\n" +
        "2. Está usando o nome correto da variável\n" +
        "3. A variável está no escopo correto"
    ]
    },
    'SyntaxError': {
      patterns: ['unexpected token', 'missing', 'invalid or unexpected token'],
      solutions: [
        "Erro de sintaxe encontrado. Verifique:\n\n" +
        "1. Se todos os parênteses, chaves e colchetes estão fechados\n" +
        "2. Se há ponto e vírgula onde necessário\n" +
        "3. Se a sintaxe do código está correta"
      ]
    }
  },
  python: {
    'IndentationError': {
      patterns: ['expected an indented block', 'unexpected indent'],
      solutions: [
        "Erro de indentação em Python. Verifique:\n\n" +
        "1. Se todos os blocos de código estão corretamente indentados\n" +
        "2. Se está usando espaços ou tabs consistentemente\n" +
        "3. Se a indentação está alinhada com o bloco pai"
      ]
    },
    'NameError': {
      patterns: ['name', 'is not defined'],
      solutions: [
        "Variável ou função não encontrada. Verifique:\n\n" +
        "1. Se a variável foi declarada antes do uso\n" +
        "2. Se o nome está escrito corretamente\n" +
        "3. Se a variável está no escopo correto"
      ]
    }
  }
}

// Internet trends and news topics
const internetTopics = {
  'tecnologia': [
    "Inteligência Artificial e Machine Learning",
    "Desenvolvimento Web Moderno",
    "Computação em Nuvem",
    "Cibersegurança"
  ],
  'tendências': [
    "Redes Sociais",
    "E-commerce",
    "Trabalho Remoto",
    "Tecnologias Emergentes"
  ],
  'segurança': [
    "Proteção de Dados",
    "Privacidade Online",
    "Ameaças Cibernéticas",
    "Boas Práticas"
  ]
}

// Math operations handler
function evaluateMathExpression(expression) {
  try {
    // Remove any potentially harmful code
    expression = expression.replace(/[^0-9+\-*/().%\s]/g, '')
    
    // Evaluate the expression safely
    return new Function('return ' + expression)()
  } catch (error) {
    return null
  }
}

// Function to detect and solve math problems
function handleMathProblem(message) {
  // Remove common math-related words
  const cleanMessage = message.toLowerCase()
    .replace(/quanto é|calcule|resolver|resultado de|math|matemática/g, '')
    .trim()
  
  // Check if it's a math expression
  const hasMathOperators = /[+\-*/()%]/.test(cleanMessage)
  const hasNumbers = /\d/.test(cleanMessage)
  
  if (hasMathOperators && hasNumbers) {
    const result = evaluateMathExpression(cleanMessage)
    if (result !== null) {
      return {
        isMath: true,
        response: `O resultado de ${cleanMessage} é ${result}`
      }
    }
  }
  
  // Check for special math keywords
  const mathKeywords = {
    'raiz quadrada': (num) => Math.sqrt(num),
    'potência': (base, exp) => Math.pow(base, exp),
    'fatorial': (num) => {
      if (num < 0) return null
      let result = 1
      for (let i = 2; i <= num; i++) result *= i
      return result
    }
  }
  
  for (const [keyword, operation] of Object.entries(mathKeywords)) {
    if (cleanMessage.includes(keyword)) {
      const numbers = cleanMessage.match(/\d+/g)
      if (numbers) {
        if (keyword === 'raiz quadrada' && numbers.length === 1) {
          const result = operation(parseFloat(numbers[0]))
          return {
            isMath: true,
            response: `A raiz quadrada de ${numbers[0]} é ${result}`
          }
        } else if (keyword === 'potência' && numbers.length === 2) {
          const result = operation(parseFloat(numbers[0]), parseFloat(numbers[1]))
          return {
            isMath: true,
            response: `${numbers[0]} elevado a ${numbers[1]} é ${result}`
          }
        } else if (keyword === 'fatorial' && numbers.length === 1) {
          const result = operation(parseInt(numbers[0]))
          if (result !== null) {
            return {
              isMath: true,
              response: `O fatorial de ${numbers[0]} é ${result}`
            }
          }
        }
      }
    }
  }
  
  return { isMath: false }
}

// Function to handle code errors
function handleCodeError(message) {
  const lowercaseMsg = message.toLowerCase()
  
  // Check if it's a code error question
  if (lowercaseMsg.includes('erro') || lowercaseMsg.includes('error')) {
    for (const [language, errors] of Object.entries(codeErrors)) {
      for (const [errorType, data] of Object.entries(errors)) {
        if (data.patterns.some(pattern => lowercaseMsg.includes(pattern.toLowerCase()))) {
          return {
            isCodeError: true,
            response: `**Erro de ${language.toUpperCase()} - ${errorType}**\n\n${data.solutions[0]}`
          }
        }
      }
    }
  }
  
  return { isCodeError: false }
}

// Function to handle internet trends and news
function handleInternetTopic(message) {
  const lowercaseMsg = message.toLowerCase()
  
  for (const [topic, items] of Object.entries(internetTopics)) {
    if (lowercaseMsg.includes(topic)) {
      const response = `Aqui estão as principais tendências em ${topic}:\n\n` +
        items.map((item, index) => `${index + 1}. ${item}`).join('\n')
      return {
        isInternetTopic: true,
        response
      }
    }
  }
  
  return { isInternetTopic: false }
}

// Context tracking
let conversationContext = {
  lastTopic: null,
  questionCount: 0,
  topics: new Set()
}

// Function to analyze message content
function analyzeMessage(message) {
  message = message.toLowerCase()
  
  // Check for question complexity
  const questionWords = ['como', 'por que', 'qual', 'quando', 'onde', 'quem', 'o que']
  const isComplex = questionWords.some(word => message.includes(word)) &&
                   message.length > 15
  
  // Identify topics
  let detectedTopics = []
  for (const [topic, data] of Object.entries(knowledgeBase)) {
    if (data.patterns.some(pattern => message.includes(pattern))) {
      detectedTopics.push(topic)
    }
  }
  
  return {
    isComplex,
    detectedTopics,
    messageLength: message.length
  }
}

// Enhanced response generation
function generateResponse(message) {
  // First, check if it's a math problem
  const mathResult = handleMathProblem(message)
  if (mathResult.isMath) {
    return mathResult.response
  }
  
  // Check if it's a code error question
  const codeErrorResult = handleCodeError(message)
  if (codeErrorResult.isCodeError) {
    return codeErrorResult.response
  }
  
  // Check if it's an internet/trends question
  const internetTopicResult = handleInternetTopic(message)
  if (internetTopicResult.isInternetTopic) {
    return internetTopicResult.response
  }
  
  const analysis = analyzeMessage(message)
  
  // Update conversation context
  conversationContext.questionCount++
  analysis.detectedTopics.forEach(topic => {
    conversationContext.topics.add(topic)
    conversationContext.lastTopic = topic
  })
  
  // Generate appropriate response
  let response = ""
  
  if (analysis.detectedTopics.length > 0) {
    // Topic-specific response
    const topic = analysis.detectedTopics[0]
    const topicResponses = knowledgeBase[topic].responses
    response = topicResponses[Math.floor(Math.random() * topicResponses.length)]
    
    // Add context from previous conversation if relevant
    if (conversationContext.questionCount > 1) {
      response += "\n\nBaseado em nossa conversa anterior, posso adicionar que..."
    }
  } else if (analysis.isComplex) {
    // Complex question handling
    response = "Esta é uma pergunta interessante e complexa. Vou tentar explicar de forma clara e detalhada.\n\n"
    response += "Existem vários aspectos a considerar:\n\n"
    response += "1. Primeiro, precisamos entender o contexto...\n"
    response += "2. Em seguida, podemos analisar os diferentes fatores...\n"
    response += "3. Por fim, chegamos a uma conclusão baseada em..."
  } else {
    // General response
    response = "Entendo sua pergunta. "
    response += "Vou tentar explicar da melhor forma possível, considerando diferentes aspectos e fornecendo uma resposta completa."
  }
  
  return response
}

// Add typing indicator
function showTypingIndicator() {
  const indicator = document.createElement('div')
  indicator.className = 'typing-indicator'
  indicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `
  chatContainer.appendChild(indicator)
  chatContainer.scrollTop = chatContainer.scrollHeight
  return indicator
}

// Add message to chat
function addMessage(text, isUser) {
  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`
  messageDiv.innerHTML = marked.parse(text)
  
  // Apply syntax highlighting to code blocks
  messageDiv.querySelectorAll('pre code').forEach((block) => {
    Prism.highlightElement(block)
  })
  
  chatContainer.appendChild(messageDiv)
  chatContainer.scrollTop = chatContainer.scrollHeight
}

// Handle sending messages
function handleSend() {
  const message = userInput.value.trim()
  if (message) {
    // Disable input while "AI is thinking"
    userInput.disabled = true
    sendButton.disabled = true
    
    // Add user message
    addMessage(message, true)
    userInput.value = ''
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator()
    
    // Generate response with variable timing based on message complexity
    const analysis = analyzeMessage(message)
    const thinkingTime = analysis.isComplex ? 2500 : 1500
    
    setTimeout(() => {
      // Remove typing indicator
      typingIndicator.remove()
      
      const aiResponse = generateResponse(message)
      addMessage(aiResponse, false)
      
      // Re-enable input
      userInput.disabled = false
      sendButton.disabled = false
      userInput.focus()
    }, thinkingTime)
  }
}

// Event listeners
sendButton.addEventListener('click', handleSend)
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSend()
  }
})

// Add initial AI greeting
setTimeout(() => {
  addMessage("Olá! Eu sou o Danzin IA, seu assistente virtual inteligente. Posso ajudar com perguntas sobre diversos assuntos, incluindo programação, erros de código, tendências da internet, matemática, ciência, tecnologia, filosofia e muito mais. Como posso ajudar você hoje?", false)
}, 500)