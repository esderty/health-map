import React, { useState } from 'react'
import Header from './companents/Header/Header'
import Footer from './companents/Footer/Footer'
import MapComponent from './companents/Map/MapComponent'
import Modal from './companents/Modal/Modal'
import './App.css'

function App() {
  const [activeModal, setActiveModal] = useState(null)

  const openModal = (modalName) => {
    setActiveModal(modalName)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const switchModal = (newModal) => {
    setActiveModal(newModal)
  }

  return (
    <div className="App">
      <Header onOpenModal={openModal} />
      
      <main>
        <div className="content">
          <h1>Карты города</h1>
          <p>Исследуйте карту нашего города</p>
          <MapComponent />
        </div>
      </main>

      <Footer />

      {/* Модальные окна */}
      <Modal 
        isOpen={activeModal === 'search'} 
        onClose={closeModal}
        type="search"
        title="Поиск по картам"
        onSwitchModal={switchModal}
      />
      
      <Modal 
        isOpen={activeModal === 'login'} 
        onClose={closeModal}
        type="login"
        title="Вход в систему"
        onSwitchModal={switchModal}
      />
      
      <Modal 
        isOpen={activeModal === 'register'} 
        onClose={closeModal}
        type="register"
        title="Регистрация"
        onSwitchModal={switchModal}
      />
    </div>
  )
}

export default App