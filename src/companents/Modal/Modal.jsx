import React, { useState, useEffect } from 'react'
import './Modal.css'

// Добавили проп data (для передачи адреса) и onSubmit (для сохранения)
const Modal = ({ isOpen, onClose, type, title, onSwitchModal, data, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Новые поля для карты
    description: '',
    rating: '5'
  })

  // Если открываем окно добавления метки, подставим адрес в название
  useEffect(() => {
    if (isOpen && type === 'add-marker' && data?.address) {
      setFormData(prev => ({ ...prev, name: data.address }))
    }
  }, [isOpen, type, data])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Логика для карты
    if (type === 'add-marker') {
      if (onSubmit) {
        // Отправляем данные обратно в MapComponent
        onSubmit({
          name: formData.name,
          description: formData.description,
          rating: formData.rating
        })
      }
      onClose() // Закрываем окно
    } 
    // Старая логика
    else if (type === 'search') {
      alert(`Поиск: ${formData.name}`)
      onClose()
    } else if (type === 'login') {
      alert(`Вход с email: ${formData.email}`)
      onClose()
    } else if (type === 'register') {
      alert(`Регистрация: ${formData.name}, ${formData.email}`)
      onClose()
    }
    
    // Очистка формы (частичная)
    setFormData(prev => ({ 
      ...prev, 
      email: '', password: '', confirmPassword: '', description: '', rating: '5' 
    }))
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSwitchModal = (newModalType) => {
    onClose()
    setTimeout(() => {
      if (onSwitchModal) onSwitchModal(newModalType)
    }, 100)
  }

  return (
    <div className="modal" onClick={handleOverlayClick}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{title}</h2>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          
          {/* --- ФОРМА ДЛЯ МЕТКИ --- */}
          {type === 'add-marker' && (
            <>
              <label style={{display: 'block', marginBottom: '5px', fontSize: '0.9rem'}}>Адрес / Название:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              
              <label style={{display: 'block', marginBottom: '5px', fontSize: '0.9rem'}}>Описание проблемы/плюса:</label>
              <textarea
                name="description"
                placeholder="Например: Отличный пандус или Грязный подъезд"
                value={formData.description}
                onChange={handleInputChange}
                style={{ width: '100%', minHeight: '80px', marginBottom: '15px', padding: '10px' }}
                required
              />

              <label style={{display: 'block', marginBottom: '5px', fontSize: '0.9rem'}}>Оценка:</label>
              <select 
                name="rating" 
                value={formData.rating} 
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
              >
                <option value="5">5 - Отлично</option>
                <option value="4">4 - Хорошо</option>
                <option value="3">3 - Нормально</option>
                <option value="2">2 - Плохо</option>
                <option value="1">1 - Ужасно</option>
              </select>
            </>
          )}

          {/* --- СТАРЫЕ ПОЛЯ --- */}
          {type === 'search' && (
            <input
              type="text"
              name="name"
              placeholder="Введите запрос..."
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          )}

          {(type === 'login' || type === 'register') && (
            <>
              {type === 'register' && (
                <input
                  type="text"
                  name="name"
                  placeholder="Имя"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              )}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              {type === 'register' && (
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              )}
            </>
          )}

          <button type="submit">
            {type === 'search' ? 'Найти' : 
             type === 'login' ? 'Войти' : 
             type === 'register' ? 'Зарегистрироваться' : 
             'Сохранить метку'}
          </button>

          {/* Ссылки переключения (оставляем как было) */}
          {type === 'login' && (
            <div className="form-footer">
              <span>Еще не зарегистрированы?</span>
              <a href="#" onClick={(e) => { e.preventDefault(); handleSwitchModal('register') }}>Регистрация</a>
            </div>
          )}
          {type === 'register' && (
            <div className="form-footer">
              <span>Уже есть аккаунт?</span>
              <a href="#" onClick={(e) => { e.preventDefault(); handleSwitchModal('login') }}>Войти</a>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default Modal