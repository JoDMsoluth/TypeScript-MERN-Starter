import React, { RefObject, createRef } from "react";
import ErrorPage from "./ErrorPage";
import AppState from "../models/client/AppState";
import ActionCreator from "../models/client/ActionCreator";
import connectPropsAndActions from "../shared/connect";
import { Redirect } from "react-router-dom";
import { Container, Header, Button, Form } from "semantic-ui-react";
import { CONTAINER_STYLE } from "../shared/styles";
import { FormattedMessage, injectIntl, WrappedComponentProps as IntlProps } from "react-intl";
import { FLAG_ENABLE_ACTIVATION_CODE } from "../shared/constants";
import ResponsiveFormField from "../components/shared/ResponsiveFormField";

interface Props extends IntlProps {
    location: Location;
    state: AppState;
    actions: ActionCreator;
}
interface States {}
class Consent extends React.Component<Props, States> {
    params: URLSearchParams;
    transactionId: string | null;
    codeRef: RefObject<HTMLInputElement>;
    constructor(props: Props) {
        super(props);
        this.codeRef = createRef();
        this.params = new URLSearchParams(this.props.location.search);
        this.transactionId = this.params.get("transactionID");
    }
    componentDidMount() {
        // This page is only redirected to
        this.props.actions.resetRedirectTask();
        this.props.actions.sendOtp(this.params.get("email") as string);
    }
    render(): React.ReactElement<any> {
        if (!this.transactionId) {
            const error: Error = { name: "No Transaction ID", message: "" };
            return <ErrorPage error={error} />;
        } else if (!this.props.state.userState.currentUser) {
            const loading: boolean = this.props.state.userState.loading;
            return (
                <Container text style={CONTAINER_STYLE}>
                    <div>
                        <Header size="medium">
                            <FormattedMessage id="page.consent.greeting" values={{email: this.params.get("email")}}/>
                        </Header>
                        <Header size="tiny">
                            <FormattedMessage id="page.consent.description" values={{app_name: this.params.get("client_name")}}/>
                        </Header>
                        <Header size="tiny">
                            <FormattedMessage id="page.consent.inquiry"/>
                        </Header>
                    </div>
                    <br />
                    {/* TODO: Add your consent texts here */}
                    {this.renderActivationCodeForm()}
                    <div>
                        <Button primary onClick={this.allow} loading={loading} disabled={loading}>
                            <FormattedMessage id="component.button.approve"/>
                        </Button>
                        <Button secondary onClick={this.deny}>
                            <FormattedMessage id="component.button.deny"/>
                        </Button>
                    </div>
                </Container>
            );
        } else {
            return <Redirect to="/" />;
        }
    }
    private renderActivationCodeForm = (): React.ReactElement<any> | undefined => {
        if (!FLAG_ENABLE_ACTIVATION_CODE) {
            return undefined;
        } else {
            return <Form>
                <ResponsiveFormField>
                    <FormattedMessage id="page.consent.OTP" />
                </ResponsiveFormField>
                <ResponsiveFormField>
                    <input placeholder={ this.props.intl.formatMessage({id: "user.OTP"}) } ref={this.codeRef} />
                </ResponsiveFormField>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                    fontSize: 12,
                    color: "grey"
                }}>
                    <label>
                        <FormattedMessage id="page.consent.OTP_not_received" />
                    </label>
                    <Button size="mini"
                        disabled={this.props.state.userState.sendOtpCoolDown > 0}
                        onClick={() => { this.props.actions.sendOtp(this.params.get("email") as string); }}>
                        {this.props.state.userState.sendOtpCoolDown > 0 ? `(${this.props.state.userState.sendOtpCoolDown})` : ""}
                        <FormattedMessage id="page.consent.OTP_resend" />
                    </Button>
                </div>
            </Form>;
        }
    }
    private allow = () => {
        if (this.transactionId) {
            const code: any = this.codeRef && this.codeRef.current && this.codeRef.current.value;
            this.props.actions.allowConsent(this.transactionId, code);
        }
    }
    private deny = () => {
        this.props.actions.denyConsent();
    }
}

export default injectIntl(connectPropsAndActions(Consent));