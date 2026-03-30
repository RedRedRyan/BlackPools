import React from 'react'

const VaultDetails = async ({params}:{params: Promise< {name: string}>}) => {
    const {name} = await params
  return (
    <div>Vault Details for  #{name}</div>
  )
}

export default VaultDetails