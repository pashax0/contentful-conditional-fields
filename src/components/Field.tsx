import React, {useEffect, useState} from 'react';
import { Paragraph, DisplayText } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import { SingleLineEditor } from '@contentful/field-editor-single-line';
// import { RadioEditor } from '@contentful/field-editor-radio';
import { MultipleEntryReferenceEditor } from '@contentful/field-editor-reference';

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const CONTENT_FIELD_ID = 'type';

const Field = (props: FieldProps) => {
  const { sdk } = props;
  const contentField = sdk.entry.fields[CONTENT_FIELD_ID];
  const [typeValue, setBlogText] = useState(contentField.getValue());

    const fieldSdk = sdk as FieldExtensionSDK;
    fieldSdk.window.startAutoResizer();

  useEffect(() => {
    const detach = contentField.onValueChanged((value) => {
      setBlogText(value);
    });
    return () => detach();
  }, [contentField]);

  const renderCorrectTypeDescription = (type: string) => {
    switch (type) {
      case 'one': return (
          <SingleLineEditor
              isInitiallyDisabled
              withCharValidation={false}
              field={sdk.field}
              locales={sdk.locales}
          />
      );
      case 'two': return (
          <>
              <SingleLineEditor
                  isInitiallyDisabled
                  withCharValidation={false}
                  field={sdk.field}
                  locales={sdk.locales}
              />
              {/*<RadioEditor*/}
              {/*    isInitiallyDisabled*/}
              {/*    field={sdk.field}*/}
              {/*    locales={sdk.locales}*/}
              {/*/>*/}
              <MultipleEntryReferenceEditor
                  viewType="link"
                  sdk={sdk}
                  isInitiallyDisabled
                  hasCardEditActions
                  parameters={{
                      instance:  {
                          showCreateEntityAction: true,
                          showLinkEntityAction: true
                      },
                  }}
              />
          </>
      );
      default: return null;
    }
  }
  // If you only want to extend Contentful's default editing experience
  // reuse Contentful's editor components
  // -> https://www.contentful.com/developers/docs/extensibility/field-editors/
  // return <Paragraph>Hello Entry Field Component</Paragraph>;
  return (
      <div style={{height: "500px"}}>

        {typeValue && <Paragraph>{renderCorrectTypeDescription(typeValue)}</Paragraph>}
          <Paragraph>{JSON.stringify(sdk.entry.fields['name'])}</Paragraph>
      </div>
  )
};

export default Field;
