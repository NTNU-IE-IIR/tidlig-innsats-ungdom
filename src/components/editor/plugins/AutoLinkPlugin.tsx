import {
  AutoLinkPlugin as LexicalAutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from '@lexical/react/LexicalAutoLinkPlugin';

const URL_REGEX =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const EMAIL_REGEX =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

const LINK_MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX),
  createLinkMatcherWithRegExp(EMAIL_REGEX),
];

import React from 'react';

const AutoLinkPlugin: React.FC = () => {
  return <LexicalAutoLinkPlugin matchers={LINK_MATCHERS} />;
};

export default AutoLinkPlugin;
