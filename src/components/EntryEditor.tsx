import React from 'react';
import { TextInput, Paragraph, Dropdown, DropdownList, DropdownListItem, Button, Flex } from '@contentful/forma-36-react-components';
import { EditorExtensionSDK } from '@contentful/app-sdk';

interface EditorProps {
  sdk: EditorExtensionSDK;
}

{/*  @ts-ignore*/}
const renderFieldsOnlyForType = (type: string) => {
    switch (type) {
        case 'one': return (
            <Paragraph>Fields for one</Paragraph>
        )
        case 'two': return (
            <Paragraph>Fields for two</Paragraph>
        )
        default: return null;
    }
}

const CONTENT_FIELD_ID = 'name';

const Entry = (props: EditorProps) => {
    const { sdk } = props;
    // const contentField = sdk.entry.fields[CONTENT_FIELD_ID];
    const [isOpen, setOpen] = React.useState(false);
    const [dropdownValue, updateDropdownValue] = React.useState(sdk.entry.fields.type.getValue() || 'Choose correct section type');
    const dropdownFieldValidations = sdk.entry.fields.type.validations[0];

    return (
      <div style={{maxWidth: '95%', margin: "10px auto"}}>
        <Paragraph>Name</Paragraph>
        <TextInput
            name="example"
            type="text"
            placeholder="Example text"
            className="f36-margin-bottom--m"
            value={sdk.entry.fields.name.getValue()}
            onChange={e => sdk.entry.fields.name.setValue(e.target.value)}
        />
          <Paragraph>Type</Paragraph>
          <Dropdown isOpen={isOpen}
            onClose={() => setOpen(false)}
            toggleElement={
                <Button
                    size="small"
                    buttonType="muted"
                    indicateDropdown
                    onClick={() => setOpen(!isOpen)}
                >
                    {dropdownValue}
                </Button>
            }>
              <DropdownList>
                  {/*  @ts-ignore*/}
                  {dropdownFieldValidations["in"].map(item => (
                      <DropdownListItem onClick={e => {
                          sdk.entry.fields.type.setValue(item);
                          updateDropdownValue(item);
                          setOpen(false);
                      }
                      }>
                          {item}
                      </DropdownListItem>
                  ))}
                  {/*<DropdownListItem onClick={e => sdk.entry.fields.type.setValue(sdk.entry.fields.type.getValue())}>*/}
                  {/*    {sdk.entry.fields.type.getValue()}*/}
                  {/*</DropdownListItem>*/}
              </DropdownList>
          </Dropdown>
          <Flex flexDirection="column" marginTop="spacingL">
              <Paragraph>Fields for this section type:</Paragraph>
              {renderFieldsOnlyForType(dropdownValue)}
          </Flex>
        {/*<Paragraph></Paragraph>*/}
        {/*  @ts-ignore*/}
        <Paragraph>{JSON.stringify(sdk.entry.fields.type.id)}</Paragraph>
      </div>
  )
};

export default Entry;
