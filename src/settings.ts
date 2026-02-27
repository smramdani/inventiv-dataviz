"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsModel = formattingSettings.Model;

class ExploreCardSettings extends FormattingSettingsCard {
  name = "explore";
  displayName = "Explore";
  slices = [];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
  exploreCard = new ExploreCardSettings();
  cards = [this.exploreCard];
}
