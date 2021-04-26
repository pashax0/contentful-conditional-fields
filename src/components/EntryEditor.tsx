import React, {useEffect, useState} from 'react';
import { Paragraph, Flex } from '@contentful/forma-36-react-components';
import { EditorExtensionSDK } from '@contentful/app-sdk';
import {Field as BaseField, FieldWrapper} from "@contentful/default-field-editors";
import { FieldExtensionSDK } from "@contentful/app-sdk";
import 'codemirror/lib/codemirror.css';
import '@contentful/forma-36-react-components/dist/styles.css';

interface EditorProps {
  sdk: EditorExtensionSDK;
}

interface EditorInterfaceControl {
    settings: object
}

type fieldType = string;

const CONDITION_SETTING = "sectionTypes";
const CONTROL_FIELD_PARAMETER = "controlField";
const INFORMATION_FIELD_PARAMETER = "informationField";

const findControlField = (sdk: EditorProps["sdk"]) => {
    // TODO: add more conditions (only one control, only specific type)
    const controlFieldData = sdk.editor.editorInterface?.controls?.find(
        // @ts-ignore
        (control: EditorInterfaceControl) => control.settings?.[CONTROL_FIELD_PARAMETER]
    );

    return controlFieldData;
}

const findInformationFields = (sdk: EditorProps["sdk"]) => {
    const informationFields = sdk.editor.editorInterface?.controls?.filter(
        // @ts-ignore
        control => control.settings?.[INFORMATION_FIELD_PARAMETER]
    );

    if (!informationFields) {
        return null;
    }

    return informationFields.map(field => field.fieldId);
}

const renderFields = (renderedFields: Array<string>, sdk: EditorProps["sdk"]) => {
    return renderedFields.map(field => {
        const fieldData = sdk.entry.fields[field];
        const localizedFieldData = fieldData.getForLocale(sdk.locales.default);

        const fieldEditorInterface = sdk.editor.editorInterface?.controls?.find(
            // @ts-ignore
            ({fieldId}) => fieldId === localizedFieldData.id
        );
// @ts-ignore
        const fieldTypeName = sdk.contentType.fields.find((fieldData: object) => fieldData.id === field).name;

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
            <FieldWrapper name={fieldTypeName} sdk={fieldSdk}>
                <BaseField sdk={fieldSdk} widgetId={widgetId}/>
            </FieldWrapper>
        )
    })
}

const Entry = (props: EditorProps) => {
    const { sdk } = props;
    {/*  @ts-ignore*/}
    const controlFieldId: fieldType = findControlField(sdk)?.fieldId;
    {/*  @ts-ignore*/}
    const controlField = sdk.entry.fields[controlFieldId];
    const informationFields = findInformationFields(sdk);

    const defaultControlFieldValue = controlField?.getValue();

    const [controlFieldValue, updateControlFieldValue] = useState(defaultControlFieldValue);

    useEffect(() => {
        controlField?.onValueChanged((value: any) => updateControlFieldValue(value));
    }, [controlField])


    {/*  @ts-ignore*/}
    const conditionsOfMainField: Array<string> = sdk.entry.fields[controlFieldId]?.validations[0]["in"];
    {/*  @ts-ignore*/}
    const controls: Array<any> = sdk.editor.editorInterface.controls;

    const conditionalFieldsData = conditionsOfMainField?.reduce((obj: object, condition: string) => {
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
        {informationFields && renderFields(informationFields, sdk)}
        {controlFieldId ?
            renderFields([controlFieldId], sdk) :
            <Paragraph>Expect one control field</Paragraph>
        }
        {controlFieldValue && (
            <Flex flexDirection="column" marginTop="spacingL" marginBottom="spacingXl">
              <Paragraph>{`Fields for ${controlFieldId} ${controlFieldValue}:`}</Paragraph>
              {renderFields(conditionalFieldsData[controlFieldValue], sdk)}
            </Flex>
        )}
      </div>
  )
};

export default Entry;
