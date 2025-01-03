import React, { useState } from 'react'

function DonationForm({ onFormSubmit }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [bankDetails, setBankDetails] = useState('')

  const handleSubmit = (event) => {
    console.log(event)
    event.preventDefault()
    if (description && amount && bankDetails) {
      onFormSubmit({ description, amount, bankDetails })
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-4'>
        <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
          Description:
        </label>
        <textarea
          id='description'
          rows={4}
          className='mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className='mb-4'>
        <label htmlFor='amount' className='block text-sm font-medium text-gray-700'>
          Amount:
        </label>
        <input
          type='number'
          id='amount'
          className='mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className='mb-4'>
        <label htmlFor='bankDetails' className='block text-sm font-medium text-gray-700'>
          Bank Details:
        </label>
        <textarea
          id='bankDetails'
          rows={4}
          className='mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={bankDetails}
          onChange={(e) => setBankDetails(e.target.value)}
          required
        />
      </div>
      <button
        type='submit'
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        disabled={!(description && amount && bankDetails)} 
      >
        Generate Post
      </button>
    </form>
  )
}

export default DonationForm
