import moment from "moment";
import * as React from "react";
import strip from "strip";

import {
  FormControl,
  IntegrationIcon,
  NameCard,
  Tags
} from "modules/common/components";

import { IUser } from "../../../auth/types";
import { ICustomer } from "../../../customers/types";
import { IBrand } from "../../../settings/brands/types";
import { IIntegration } from "../../../settings/integrations/types";
import { IConversation } from "../../types";
import {
  AssigneeImg,
  AssigneeWrapper,
  CheckBox,
  CustomerName,
  FlexContent,
  MainInfo,
  MessageContent,
  RowContent,
  RowItem,
  SmallText,
  SmallTextOneLine
} from "./styles";

type Props = {
  conversation: IConversation;
  channelId?: string;
  isActive: boolean;
  onClick: (conversation: IConversation) => void;
  toggleCheckbox: (conversation: IConversation, checked: boolean) => void;
  selectedIds: any[];
  currentUser?: IUser;
};

class ConversationItem extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.onClickCheckBox = this.onClickCheckBox.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
  }

  toggleCheckbox(e) {
    const { toggleCheckbox, conversation } = this.props;

    toggleCheckbox(conversation, e.target.checked);
  }

  onClick(e) {
    e.preventDefault();

    const { onClick, conversation } = this.props;

    onClick(conversation);
  }

  renderCheckbox() {
    if (!this.props.toggleCheckbox) {
      return null;
    }

    return (
      <CheckBox onClick={this.onClickCheckBox}>
        <FormControl componentClass="checkbox" onChange={this.toggleCheckbox} />
      </CheckBox>
    );
  }

  onClickCheckBox(e) {
    e.stopPropagation();
  }

  renderFullName(customer) {
    if (customer.firstName || customer.lastName) {
      return (customer.firstName || "") + " " + (customer.lastName || "");
    }

    return null;
  }

  getVisitorInfo(customer) {
    if (customer.visitorContactInfo) {
      const visitor = customer.visitorContactInfo;

      return (
        this.renderFullName(visitor) ||
        visitor.lastName ||
        visitor.email ||
        visitor.phone
      );
    }

    return null;
  }

  render() {
    const { currentUser } = this.props;

    const { conversation, isActive, selectedIds = [] } = this.props;
    const { createdAt, updatedAt, content } = conversation;
    const customer = conversation.customer || ({} as ICustomer);
    const integration = conversation.integration || ({} as IIntegration);
    const brand = integration.brand || ({} as IBrand);
    const brandName = brand.name;
    const tags = conversation.tags || [];
    const assignedUser = conversation.assignedUser;
    const isExistingCustomer = customer && customer._id;
    const isChecked = selectedIds.map(e => e._id).includes(conversation._id);

    const isRead =
      conversation.readUserIds &&
      conversation.readUserIds.indexOf(currentUser._id) > -1;

    return (
      <RowItem onClick={this.onClick} isActive={isActive} isRead={isRead}>
        <RowContent isChecked={isChecked}>
          {this.renderCheckbox()}
          <FlexContent>
            <MainInfo>
              {isExistingCustomer && (
                <NameCard.Avatar
                  size={40}
                  customer={customer}
                  icon={
                    <IntegrationIcon
                      integration={integration}
                      customer={customer}
                      facebookData={conversation.facebookData}
                      twitterData={conversation.twitterData}
                    />
                  }
                />
              )}
              <FlexContent>
                <CustomerName>
                  {isExistingCustomer &&
                    (this.renderFullName(customer) ||
                      customer.primaryEmail ||
                      customer.primaryPhone ||
                      this.getVisitorInfo(customer) ||
                      "Unnamed")}
                </CustomerName>

                <SmallTextOneLine>
                  to {brandName} via {integration && integration.kind}
                </SmallTextOneLine>
              </FlexContent>
            </MainInfo>

            <MessageContent>{strip(content)}</MessageContent>
            <Tags tags={tags} limit={3} />
          </FlexContent>
        </RowContent>

        <SmallText>
          {moment(updatedAt || createdAt).fromNow()}

          {assignedUser && (
            <AssigneeWrapper>
              <AssigneeImg
                src={
                  assignedUser.details.avatar || "/images/avatar-colored.svg"
                }
              />
            </AssigneeWrapper>
          )}
        </SmallText>
      </RowItem>
    );
  }
}

export default ConversationItem;