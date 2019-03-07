import React from 'react'
import { StyleSheet, css } from 'aphrodite'
import theme from '../styles/theme'
import loadData from '../containers/hoc/load-data'
import wrapMutations from '../containers/hoc/wrap-mutations'
import GSForm from './forms/GSForm'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import Paper from 'material-ui/Paper'
import Form from 'react-formal'
import yup from 'yup'
import gql from 'graphql-tag'
import LoadingIndicator from './LoadingIndicator';

class TexterRequest extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      // Set default assignment size to 1000 if TEXTER_REQUEST_FORM_COUNT is not set to unlimited
      count: this.props.data.organization.textRequestMaxCount,
      email: undefined,
      submitting: false,
      error: undefined,
      finished: false
    }
  }

  componentDidMount() {
    this.props.data.refetch()
    this.props.data.startPolling(10000)
  }

  submit = async () => {
    const { count, email } = this.state
    this.setState({ submitting: true })
    try {
      const response = await this.props.mutations.requestTexts({ count, email })
      const message = response.data.requestTexts

      if (message.includes('Created')) {
        this.setState({ submitting: false, finished: true })
      } else if (message === 'Unrecognized email' ) {
        this.setState({
          error: `Unrecognized email: please make sure you're logged into Spoke with the same email as Slack.`,
          submitting: false
        })
      } else if (message === "Not created; a shift already requested < 10 mins ago.") {
        this.setState({
          submitting: false,
          finished: true
        })
      } else if (message === 'No texts available at the moment') {
        this.setState({
          error: message,
          submitting: false
        })
      } else {
        this.setState({
          finished: true,
          submitting: false
        })
      }
    } catch (e) {
      console.error(e)
      this.setState({ error: e, submitting: false })
    } 
  }

  componentWillMount() {
    this.state.email = this.props.user.email
  }

  render() {
    // Disable form for non-int values or 0; -1 is unlimited
    if (this.props.data.loading) {
      return (
        <LoadingIndicator />
      )
    }

    // const { textsAvailable, textRequestFormEnabled, textRequestMaxCount } = this.props.data.organization
    // if (!(textsAvailable && textRequestFormEnabled)) {
    //   return (
    //     <Paper>
    //       <div style={{ padding: '20px' }}>
    //         <h3> No texts available right now </h3>
    //         <p> Watch Slack for an announcement on when new texts are available! </p>
    //       </div>
    //     </Paper>
    //   )
    // }

    const textsAvailable = true
    const textRequestFormEnabled = true
    const textRequestMaxCount = 500

    const { email, count, error, submitting, finished } = this.state
    const inputSchema = yup.object({
      count: yup.number().required(),
      email: yup.string().required()
    })

    if (finished) {
      return (
        <div>
          <h3> Submitted Successfully – Thank you! </h3>
          <p> Give us a few minutes to assign your texts. You'll receive an email notification when we've done so. If you requested your texts after hours, you’ll get them when texting opens at 9am ET :). </p>
        </div>
      )
    }

    return (
      <div>
        <div>
          Ready for texts? Just tell us how many
          {textRequestMaxCount > 0 ? ` (currently limited to ${textRequestMaxCount}/person)` : ''}.
        </div>
        <GSForm ref='requestForm' schema={inputSchema} value={{ email, count }}
          onSubmit={this.submit}
        >
          <label htmlFor="count"> Count: </label>
          <TextField
            name='count'
            label='Count'
            type='number'
            value={count}
            onChange={e => {
              const formVal = parseInt(e.target.value, 10) || 0
              let count = textRequestMaxCount > 0 ? Math.min(textRequestMaxCount, formVal) : formVal
              count = Math.max(count, 0)
              this.setState({ count })
            }}
          />
          <br/>
          <RaisedButton primary={true} onClick={this.submit} disabled={submitting} fullWidth> Request More Texts </RaisedButton>
        </GSForm>
        {error && <div style={{color: 'red'}}>
          <p> {error} </p>
        </div>}
      </div>
    )
  }
}

const mapQueriesToProps = ({ ownProps }) => ({
  data: {
    query: gql`query currentUser($organizationId: String!) {
      organization(id: $organizationId) {
        textRequestFormEnabled
        textRequestMaxCount
        textsAvailable
      }
    }`,
    variables: {
      organizationId: ownProps.organizationId
    }
  }
})


const mapMutationsToProps = ({ ownProps }) => ({
  requestTexts: ({count, email}) => ({
    mutation: gql`
      mutation requestTexts($count: Int!, $email: String!, $organizationId: String!) {
        requestTexts(count: $count, email: $email, organizationId: $organizationId)
      }
    `,
    variables: {
      count,
      email,
      organizationId: ownProps.organizationId
    },
    pollInterval: 10000
  })
})

export default loadData(wrapMutations(TexterRequest), {
  mapQueriesToProps,
  mapMutationsToProps
})

