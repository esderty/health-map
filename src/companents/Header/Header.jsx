import React from 'react'
import './Header.css'

const Header = ({ onOpenModal }) => {
  return (
    <header className="header">
      <img src="/logo.png" className="logo" alt="Логотип" />
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