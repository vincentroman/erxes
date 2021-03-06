import {
  ActionButtons,
  Button,
  EmptyState,
  ModalTrigger,
  Table
} from 'modules/common/components';
import { __, Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { Collapse } from 'react-bootstrap';
import Toggle from 'react-toggle';
import { PropertyForm, PropertyGroupForm } from '../containers';
import { CollapseRow, DropIcon, FieldType } from '../styles';
import { IFieldGroup } from '../types';

type Props = {
  group: IFieldGroup;
  queryParams: any;
  removePropertyGroup: (data: { _id: string }) => any;
  removeProperty: (data: { _id: string }) => void;
  updatePropertyVisible: (params: { _id: string; isVisible: boolean }) => void;
};

type State = {
  collapse: boolean;
};

class PropertyRow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      collapse: true
    };

    this.renderTable = this.renderTable.bind(this);
    this.renderTableRow = this.renderTableRow.bind(this);
    this.renderActionButtons = this.renderActionButtons.bind(this);
    this.handleCollapse = this.handleCollapse.bind(this);
    this.visibleHandler = this.visibleHandler.bind(this);
  }

  handleCollapse() {
    this.setState({ collapse: !this.state.collapse });
  }

  visibleHandler(e, property) {
    if (property.isDefinedByErxes) {
      return Alert.error(__('You cannot update this property'));
    }

    const isVisible = e.target.checked;

    return this.props.updatePropertyVisible({ _id: property._id, isVisible });
  }

  renderActionButtons(data, remove, content) {
    if (data.isDefinedByErxes) return null;

    return (
      <ActionButtons>
        <ModalTrigger
          title="Edit Property"
          trigger={<Button btnStyle="link" icon="edit" />}
          content={content}
        />
        <Button
          btnStyle="link"
          icon="cancel-1"
          onClick={() =>
            confirm().then(() => {
              remove({ _id: data._id });
            })
          }
        />
      </ActionButtons>
    );
  }

  renderTableRow(field) {
    const { removeProperty, queryParams } = this.props;

    return (
      <tr key={field._id}>
        <td>
          {field.text}
          <FieldType>{field.type}</FieldType>
        </td>
        <td>
          {field.lastUpdatedUser
            ? field.lastUpdatedUser.details.fullName
            : 'Unknown'}
        </td>
        <td>
          <Toggle
            defaultChecked={field.isVisible}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
            onChange={e => this.visibleHandler(e, field)}
          />
        </td>
        <td>
          {this.renderActionButtons(field, removeProperty, props => (
            <PropertyForm {...props} field={field} queryParams={queryParams} />
          ))}
        </td>
      </tr>
    );
  }

  renderTable(fields) {
    if (fields.length === 0) {
      return (
        <EmptyState
          icon="circular"
          text="There arent't any fields in this group"
        />
      );
    }

    return (
      <Table hover>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Last Updated By')}</th>
            <th>{__('Visible')}</th>
            <th />
          </tr>
        </thead>
        <tbody>{fields.map(field => this.renderTableRow(field))}</tbody>
      </Table>
    );
  }

  render() {
    const { group, removePropertyGroup, queryParams } = this.props;
    const { fields = [] } = group;

    return (
      <li key={group._id}>
        <CollapseRow>
          <div style={{ flex: 1 }} onClick={this.handleCollapse}>
            <DropIcon isOpen={this.state.collapse} />
            {group.name} <span>{group.description}</span>
          </div>
          {this.renderActionButtons(group, removePropertyGroup, props => (
            <PropertyGroupForm
              {...props}
              group={group}
              queryParams={queryParams}
            />
          ))}
        </CollapseRow>
        <Collapse in={this.state.collapse}>
          <div>{this.renderTable(fields)}</div>
        </Collapse>
      </li>
    );
  }
}

export default PropertyRow;
