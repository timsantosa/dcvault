import React from 'react'

// Card shell used by the redesigned account and admin pages
// (styles in client/css/account-redesign.css).
const AccountCard = (props) => {
  return (
    <div className={'acct-card' + (props.className ? ' ' + props.className : '')}>
      <div className='acct-card__header'>
        <h2 className='acct-card__title'>{props.title}</h2>
        {props.action || null}
      </div>
      <div className='acct-card__body'>
        {props.children}
      </div>
    </div>
  )
}

export default AccountCard
