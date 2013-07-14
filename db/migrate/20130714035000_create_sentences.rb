class CreateSentences < ActiveRecord::Migration
  def change
    create_table :sentences do |t|
      t.string :content
      t.integer :player_id

      t.timestamps
    end
    add_index :sentences, [:player_id, :created_at]
  end
end
