import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true); // Simula envío exitoso
  };

  return (
    <div className="contact-page" style={{ maxWidth: 700, margin: "0 auto", padding: "2rem" }}>
      <h1>Contacto</h1>
      <p>
        ¿Tienes alguna pregunta, sugerencia o necesitas soporte? <br />
        Escríbenos a <a href="mailto:contacto@emberlight.com">contacto@emberlight.com</a>
      </p>
      <p>
        También puedes encontrarnos en nuestras redes sociales o completar el formulario de contacto:
      </p>
      {sent ? (
        <p style={{ color: "#48874b", fontWeight: 600, marginTop: "1.5rem" }}>
          ¡Gracias por contactarnos! Te responderemos pronto.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Nombre</label><br />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>Email</label><br />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>Mensaje</label><br />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              style={{ width: "100%", padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc" }}
            />
          </div>
          <button type="submit" style={{
            background: "#48874b",
            color: "white",
            padding: "0.7rem 2rem",
            borderRadius: 4,
            border: "none",
            fontWeight: 600,
            cursor: "pointer"
          }}>
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}

export default Contact;
