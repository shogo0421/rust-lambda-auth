interface ButtonProps {
  children: React.ReactNode
  width: string
  onClick: () => void
}

function Button(props: ButtonProps) {
  return (
    <div
      style={{
        width: props.width,
        margin: 'auto',
        padding: '10px 20px',
        border: 'solid',
        fontSize: '1.2em',
        borderRadius: '10px',
        backgroundColor: '#00B900',
        color: 'white',
      }}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  )
}

export default Button
