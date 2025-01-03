import { useState } from 'react'
import DonationForm from './components/DonationForm'
import SocialMediaPost from './components/SocialMediaPost'

function App() {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    bankDetails: '',
  })

  const handleFormSubmit = (data) => {
    setFormData(data)
  }

  console.log(formData)
  return (
    <div className='container mx-auto p-4'>
      <DonationForm onFormSubmit={handleFormSubmit} />
      {formData.description && (
        <SocialMediaPost
          description={formData.description}
          amount={formData.amount}
          bankDetails={formData.bankDetails}
        />
      )}
    </div>
  )
}

export default App
