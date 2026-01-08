import axios from 'axios'

const BASE_URL = 'http://localhost:3001/api'
const TOKEN_KEY = 'teste12345_token'

// Função para gerar um novo token JWT
async function generateToken(): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      throw new Error(`Erro ao gerar token: ${response.status}`)
    }

    const data = await response.json()
    const token = data.token

    // Armazena o token no localStorage
    localStorage.setItem(TOKEN_KEY, token)
    
    return token
  } catch (error) {
   // console.error('Erro ao gerar token:', error)
    throw error
  }
}

// Função para obter o token (do localStorage ou gerar novo)
async function getToken(): Promise<string> {
  let token = localStorage.getItem(TOKEN_KEY)
  
  if (!token) {
    token = await generateToken()
  }
  
  return token
}

// Função wrapper para fazer requisições autenticadas
async function authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    let token = await getToken()
   // console.log('Token obtido:', token ? token.substring(0, 20) + '...' : 'null')

    const url = `${BASE_URL}${endpoint}`
   // console.log('Fazendo requisição para:', url)

    // Primeira tentativa com token atual
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

  //  console.log('Status da resposta:', response.status, response.statusText)

    // Se receber 401, token expirou - gera novo e tenta novamente
    if (response.status === 401) {
      console.log('Token expirado (401), gerando novo token...')
      token = await generateToken()
      console.log('Novo token gerado:', token ? token.substring(0, 20) + '...' : 'null')
      
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
   //   console.log('Status da segunda tentativa:', response.status, response.statusText)
    }

    if (!response.ok) {
      const errorText = await response.text()
     // console.error('Erro na resposta:', response.status, errorText)
      throw new Error(`Erro na requisição: ${response.status}`)
    }

    const data = await response.json()
 //   console.log('Dados recebidos da API:', data)
    return { success: true, data }
  } catch (error) {
    // Silenciosamente retorna erro sem logar no console
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

// Interface para os parâmetros dos KPIs
interface GetKPIsParams {
  startDate: string
  endDate: string
  typeMaintenance: string
}

// Função para buscar KPIs de performance
export async function getKPIs(params: GetKPIsParams) {
  const { startDate, endDate, typeMaintenance } = params
  
  // Só adiciona typeMaintenance se não estiver vazio
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
  })
  
  if (typeMaintenance && typeMaintenance.trim() !== '') {
    queryParams.append('typeMaintenance', typeMaintenance)
  }

  return authenticatedFetch(
    `/maintenance/reports/performance-indicator?${queryParams.toString()}`,
    { method: 'GET' }
  )
}

// Inicializa o token automaticamente ao carregar o módulo
if (typeof window !== 'undefined') {
  getToken().catch(console.error)
}

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
})
