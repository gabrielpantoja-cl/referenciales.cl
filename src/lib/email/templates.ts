// lib/email/templates.ts
interface EmailTemplate {
  subject: string;
  html: string;
}

/* eslint-disable no-unused-vars */
interface EmailTemplates {
  welcome: (userName: string) => EmailTemplate;
  deleteAccount: (userName: string) => EmailTemplate;
}
/* eslint-enable no-unused-vars */

export const emailTemplates: EmailTemplates = {
  welcome: (userName: string) => ({
    subject: 'Bienvenido a Referenciales',
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb;">¡Bienvenido ${userName}!</h2>
        </div>
        
        <div style="color: #4b5563; line-height: 1.6;">
          <p>Gracias por registrarte en Referenciales.</p>
          <p>Tu cuenta ha sido creada exitosamente y ya puedes comenzar a usar nuestros servicios.</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <div style="color: #6b7280; font-size: 14px;">
          <p>Saludos,<br>El equipo de Referenciales</p>
        </div>
      </div>
    `
  }),
  
  deleteAccount: (userName: string) => ({
    subject: 'Cuenta Eliminada - Referenciales',
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb;">Cuenta Eliminada</h2>
        </div>
        
        <div style="color: #4b5563; line-height: 1.6;">
          <p>Hola ${userName},</p>
          <p>Tu cuenta en Referenciales ha sido eliminada exitosamente.</p>
          <p>Esperamos volver a verte pronto.</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <div style="color: #6b7280; font-size: 14px;">
          <p>Saludos,<br>El equipo de Referenciales</p>
        </div>
      </div>
    `
  })
};