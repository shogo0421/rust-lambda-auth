interface TextBoxProps {
  children: React.ReactNode
}

function TextBox(props: TextBoxProps) {
  return (
    <div
      style={{
        margin: '10px 100px',
        padding: '10px 20px',
        border: 'solid',
        fontSize: '1.2em',
        textAlign: 'left',
        overflowWrap: 'break-word',
      }}
    >
      {props.children == '' ? 'データ未取得' : props.children}
    </div>
  )
}

export default TextBox
