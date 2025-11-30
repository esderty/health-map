import React from 'react'
import './Header.css'
// 1. Импортируем логотип
import logoSrc from '../../assets/logo.png' // Убедитесь, что путь правильный!

const Header = ({ onOpenModal }) => {
  return (
    <header className="header">
      {/* 2. Используем импортированную переменную */}
      <img src={logoSrc} className="logo" alt="Логотип" /> 
      <div className="headerMenu">
        <h3 className="search" onClick={() => onOpenModal('search')}>
          Поиск
        </h3>
        <a href="#" className="exit" onClick={(e) => {
          e.preventDefault()
          onOpenModal('login')
        }}>
          Войти
        </a>
      </div>
    </header>
  )
}

export default Header