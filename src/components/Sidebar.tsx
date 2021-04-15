import React, {useState, useEffect} from 'react';
import { Paragraph } from '@contentful/forma-36-react-components';
import { SidebarExtensionSDK } from '@contentful/app-sdk';
import {Heading} from "@contentful/forma-36-react-components";

interface SidebarProps {
  sdk: SidebarExtensionSDK;
}

const CONTENT_FIELD_ID = 'type';

const Sidebar = (props: SidebarProps) => {
  const { sdk } = props;
  const contentField = sdk.entry.fields[CONTENT_FIELD_ID];

  const [typeValue, setBlogText] = useState(contentField.getValue());

  // Listen for onChange events and update the value
  useEffect(() => {
    const detach = contentField.onValueChanged((value) => {
      setBlogText(value);
    });
    return () => detach();
  }, [contentField]);

  const renderCorrectTypeDescription = (type: string) => {
    switch (type) {
      case 'one': return 'This section used with one fields:';
      case 'two': return 'This section used with two fields:';
      default: return null;
    }
  }

  return (
      <>
        <Heading>{typeValue ? typeValue : 'Choose section type'}</Heading>
        {typeValue && <Paragraph>{renderCorrectTypeDescription(typeValue)}</Paragraph>}
      </>
  );
};

export default Sidebar;
