import React from 'react';
import { TextInput, Paragraph, Dropdown, DropdownList, DropdownListItem, Button, Flex } from '@contentful/forma-36-react-components';
import { EditorExtensionSDK } from '@contentful/app-sdk';

import {Field as BaseField, FieldWrapper} from "@contentful/default-field-editors";
import { FieldExtensionSDK } from "@contentful/app-sdk";

interface EditorProps {
  sdk: EditorExtensionSDK;
}

type SectionType = string;

const findControlField = (sdk: EditorProps["sdk"]) => {
    // TODO: add more conditions (only one control, only specific type)
    const controlFieldData = sdk.editor.editorInterface?.controls?.find(
        // @ts-ignore
        control => control.settings?.controlField
    );
    return controlFieldData;
}

const renderFields = (renderedFields: Array<string>, sdk: EditorProps["sdk"]) => {
    return renderedFields.map(field => {
        const fieldData = sdk.entry.fields[field];
        const localizedFieldData = fieldData.getForLocale(sdk.locales.default);

        const fieldEditorInterface = sdk.editor.editorInterface?.controls?.find(
            // @ts-ignore
            ({fieldId}) => fieldId === localizedFieldData.id
        );

        const widgetId = fieldEditorInterface?.widgetId ?? '';

        const fieldSdk: FieldExtensionSDK = {
            ...sdk,
            field: localizedFieldData,
            locales: sdk.locales,
            parameters: {
                ...sdk.parameters,
                instance: {
                    ...sdk.parameters.instance,
                    ...fieldEditorInterface?.settings,
                },
            },
        } as any;

        return (
            <FieldWrapper name={field} sdk={fieldSdk}>
                <BaseField sdk={fieldSdk} widgetId={widgetId}/>
            </FieldWrapper>
        )
    })
}

const CONDITION_SETTING = "sectionTypes";

const Entry = (props: EditorProps) => {
    const { sdk } = props;
    // const contentField = sdk.entry.fields[CONTENT_FIELD_ID];
    const [isOpen, setOpen] = React.useState(false);
    const [dropdownValue, updateDropdownValue] = React.useState(sdk.entry.fields.type.getValue() || 'Choose correct section type');

    const controlFieldId = findControlField(sdk)?.fieldId;
    {/*  @ts-ignore*/}
    const conditionsOfMainField: Array<string> = sdk.entry.fields[controlFieldId].validations[0]["in"];
    {/*  @ts-ignore*/}
    const controls: Array<any> = sdk.editor.editorInterface.controls;

    const conditionalFieldsData = conditionsOfMainField.reduce((obj: object, condition: string) => {
        const fieldsWithCondition = controls.filter(control => {
            const controlConditionSettingsString: string = control.settings?.[CONDITION_SETTING];
            const controlConditionSettings: Array<string> = controlConditionSettingsString?.split(", ");
            return controlConditionSettings?.includes(condition);
        });
        const idsOfConditionalField = fieldsWithCondition.map(field => field.fieldId);

        return {
            ...obj,
            [condition]: idsOfConditionalField
        }
    }, {})

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
          <Dropdown
            isOpen={isOpen}
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

                  {conditionsOfMainField.map(condition => (
                      <DropdownListItem onClick={e => {
                          sdk.entry.fields.type.setValue(condition);
                          updateDropdownValue(condition);
                          setOpen(false);
                      }
                      }>
                          {condition}
                      </DropdownListItem>
                  ))}
                  {/*<DropdownListItem onClick={e => sdk.entry.fields.type.setValue(sdk.entry.fields.type.getValue())}>*/}
                  {/*    {sdk.entry.fields.type.getValue()}*/}
                  {/*</DropdownListItem>*/}
              </DropdownList>
          </Dropdown>
          <Flex flexDirection="column" marginTop="spacingL" marginBottom="spacingXl">
              <Paragraph>Fields for this section type:</Paragraph>
              {/*  @ts-ignore*/}
              {renderFields(conditionalFieldsData[dropdownValue], sdk)}
          </Flex>
        {/*<Paragraph></Paragraph>*/}
        {/*  @ts-ignore*/}
        {/*<Paragraph>{JSON.stringify(sdk.editor.editorInterface.controls?.find(control => control.fieldId === "paragraph"))}</Paragraph>*/}
        {/*  @ts-ignore*/}
        {/*<Paragraph>{JSON.stringify(findControlField(sdk))}</Paragraph>*/}
      </div>
  )
};

export default Entry;
