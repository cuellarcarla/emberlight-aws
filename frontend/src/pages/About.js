import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="about-page" style={{ maxWidth: 700, margin: "0 auto", padding: "2rem" }}>
      <h1>Sobre nosotros</h1>
      <p>
        <strong>EmberLight</strong> nació de la pasión por la tecnología y el deseo de crear soluciones digitales que realmente ayuden a las personas. Somos un equipo pequeño, pero muy motivado, formado por dos personas con perfiles complementarios:
      </p>
      <ul>
        <li>
          <strong>Paul Maigua</strong> – <em>Desarrollador Full Stack</em><br />
          Apasionado del código limpio y las interfaces intuitivas. Se encarga de todo el desarrollo de la aplicación, desde el frontend hasta la lógica del backend.
        </li>
        <li>
          <strong>Carla Cuéllar</strong> – <em>Infraestructura y DevOps</em><br />
          Especialista en servidores, despliegue y seguridad. Garantiza que la plataforma esté siempre disponible, rápida y segura para todos los usuarios.
        </li>
      </ul>
      <h2>Nuestra misión</h2>
      <p>
        Hacer la tecnología accesible y útil para todos, creando herramientas web robustas, seguras y fáciles de usar.
      </p>
      <h2>Nuestros valores</h2>
      <ul>
        <li>Transparencia y comunicación directa</li>
        <li>Compromiso con la calidad y la seguridad</li>
        <li>Escucha activa a los usuarios para mejorar cada día</li>
      </ul>
      <h2>¿Por qué confiar en nosotros?</h2>
      <p>
        Nos mueve la honestidad y el trabajo bien hecho. Cada línea de código y cada decisión de infraestructura están pensadas para dar el mejor servicio posible.
      </p>
      {/* Botón de volver al inicio */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link to="/" style={{
          display: "inline-block",
          background: "#48874b",
          color: "white",
          padding: "0.7rem 2rem",
          borderRadius: 4,
          textDecoration: "none",
          fontWeight: 600
        }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default About;
