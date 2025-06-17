import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class Supabase {
  public supabase: SupabaseClient; 
  constructor() {this.supabase = createClient('https://ltlzjkqhulpaydaoldma.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bHpqa3FodWxwYXlkYW9sZG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTc5ODMsImV4cCI6MjA2NDk5Mzk4M30.1XAbtNEDQRCuhdfvMnwMif0Vn_avDw0b9ZKpNuZE1xM') }
   // Función para subir la imagen al almacenamiento de Supabase
  async uploadImage(file: File, path: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from('imagenes') // Asegúrate de tener un bucket de imágenes
        .upload(path, file);

      if (error) {
        throw error;
      }

      // Devuelve la URL pública de la imagen
      const url = this.supabase.storage.from('imagenes').getPublicUrl(data.path);
      return url.data.publicUrl;
    } catch (err) {
      console.error('Error al subir imagen:', err);
      return null;
    }
  }

   // Método para guardar el usuario en la base de datos
  async saveUser(data: any) {
    try {
      const { data: result, error } = await this.supabase
        .from('usuarios')  // Asegúrate de que la tabla 'usuarios' esté bien definida en Supabase
        .insert([data]);

      if (error) {
        console.error('Error al insertar los datos:', error.message);
        return;
      }

      console.log('Usuario guardado:', result);
    } catch (err) {
      console.error('Error al guardar usuario:', err);
    }
  }


// Función para registrar un nuevo usuario con email y contraseña
  async signUp(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      
      return data.user; // Devuelve el usuario si el registro fue exitoso
    } catch (err: any) {
      console.error('Error en el registro:', err.message || err);
      throw err;
    }
  }

  // Función para iniciar sesión
  
// Método para iniciar sesión utilizando el sistema de autenticación de Supabase
async signIn(email: string, password: string) {
  try {
    // Usamos el método de Supabase para autenticar con el email y la contraseña
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      return null;
    }
    return data.user;  // Retornamos los datos del usuario si la autenticación fue exitosa

  } catch (err: any) {
    console.error('Error al iniciar sesión:', err.message || err);
    return null;
  }
}

  // Función para cerrar sesión
  async signOut() {
    await this.supabase.auth.signOut();
  }

  // Función para verificar si el email está verificado
  async verifyEmail() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      if (error) throw new Error(error.message);
      
      // Comprobamos si el correo fue confirmado usando `email_confirmed_at`
      return data?.user?.user_metadata?.["email_confirmed_at"] ? true : false;
    } catch (err: any) {
      console.error('Error al obtener el usuario:', err.message || err);
      return false;
    }
  }

  // Obtener usuarios desde la base de datos
async getUsers() {
  const { data, error } = await this.supabase.from('usuarios').select('*');  // Asegúrate de que la tabla 'usuarios' esté bien definida en Supabase
  if (error) {
    throw error;
  }
  return data;
}

getPublicUrl(path: string): string {
  const { data } = this.supabase.storage.from('imagenes').getPublicUrl(path);
  return data?.publicUrl || '';
}

}



