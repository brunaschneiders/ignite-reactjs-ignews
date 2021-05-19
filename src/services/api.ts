import axios from "axios";

export const api = axios.create({
  // a URL completa é: http://localhost:3000/api mas o axios já aproveita a URL da aplicação
  baseURL: "/api",
});
